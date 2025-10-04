import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
// Función para generar ID único sin dependencias externas
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    // Obtener datos del formulario
    const formData = await request.formData()
    const image = formData.get('image') as File
    const type = formData.get('type') as string

    if (!image || !type) {
      return NextResponse.json({ message: 'Imagen y tipo requeridos' }, { status: 400 })
    }

    // Validar tamaño (máximo 2MB)
    if (image.size > 2 * 1024 * 1024) {
      return NextResponse.json({ message: 'La imagen es demasiado grande. Máximo 2MB' }, { status: 400 })
    }

    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'store-images')
    await mkdir(uploadsDir, { recursive: true })

    // Convertir File a Buffer y validar con Sharp por contenido real
    const originalBuffer = Buffer.from(await image.arrayBuffer())
    let processedBuffer: Buffer
    let outputExtension = 'jpg'
    try {
      const img = sharp(originalBuffer, { failOn: 'error' })
      const metadata = await img.metadata()
      if (!metadata.format) {
        return NextResponse.json({ message: 'Imagen inválida' }, { status: 400 })
      }
      // Re-encodear a formato seguro (JPEG) y limitar dimensiones
      processedBuffer = await img
        .rotate()
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer()
      outputExtension = 'jpg'
    } catch (e) {
      return NextResponse.json({ message: 'No se pudo procesar la imagen' }, { status: 400 })
    }

    // Generar nombre único para el archivo procesado
    const fileName = `${type}-${session.user.id}-${generateUniqueId()}.${outputExtension}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, processedBuffer)

    // Generar URL relativa
    const imageUrl = `/uploads/store-images/${fileName}`

    // Actualizar en la base de datos
    const updateData = type === 'banner' 
      ? { bannerImage: imageUrl }
      : { profileImage: imageUrl }

    await prisma.storeSettings.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        storeName: 'Mi Tienda',
        storeSlug: `tienda-${session.user.id}-${Date.now()}`,
        country: 'Mexico',
        language: 'es',
        currency: 'MXN',
        distanceUnit: 'km',
        mapProvider: 'openstreetmap',
        taxRate: 0.0,
        taxMethod: 'included',
        enableBusinessHours: false,
        disableCheckoutOutsideHours: false,
        paymentsEnabled: true,
        storeActive: false,
        passwordProtected: false,
        ...updateData
      }
    })

    console.log('✅ Image uploaded successfully:', {
      type,
      fileName,
      imageUrl,
      fileSize: processedBuffer.length
    })

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: `${type === 'banner' ? 'Banner' : 'Foto de perfil'} subida correctamente`
    })

  } catch (error) {
    console.error('❌ Error uploading image:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
