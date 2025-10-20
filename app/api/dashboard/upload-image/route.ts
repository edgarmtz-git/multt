import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
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

    // Validar tipo de archivo
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Solo se permiten archivos de imagen' }, { status: 400 })
    }

    // Validar tamaño (máximo 2MB)
    if (image.size > 2 * 1024 * 1024) {
      return NextResponse.json({ message: 'La imagen es demasiado grande. Máximo 2MB' }, { status: 400 })
    }

    // Check if running on Vercel (serverless)
    if (process.env.VERCEL) {
      return NextResponse.json({
        message: 'El upload de imágenes requiere configurar Vercel Blob Storage. Por ahora, puedes usar URLs de imágenes externas (Imgur, Cloudinary, etc).',
        error: 'STORAGE_NOT_CONFIGURED'
      }, { status: 501 })
    }

    // Crear directorio si no existe (solo funciona en local)
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'store-images')
    await mkdir(uploadsDir, { recursive: true })

    // Generar nombre único para el archivo
    const fileExtension = image.name.split('.').pop() || 'jpg'
    const fileName = `${type}-${session.user.id}-${generateUniqueId()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convertir File a Buffer y guardar
    const buffer = Buffer.from(await image.arrayBuffer())
    await writeFile(filePath, buffer)

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
      fileSize: buffer.length
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
