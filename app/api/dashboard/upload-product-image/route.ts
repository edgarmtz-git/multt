import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
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

    if (!image) {
      return NextResponse.json({ message: 'Imagen requerida' }, { status: 400 })
    }

    // Validar tamaño (máximo 10MB para productos)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'La imagen es demasiado grande. Máximo 10MB' }, { status: 400 })
    }

    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'product-images')
    await mkdir(uploadsDir, { recursive: true })

    // Convertir File a Buffer y validar por contenido con Sharp
    const originalBuffer = Buffer.from(await image.arrayBuffer())
    let processedBuffer: Buffer
    let outputExtension = 'jpg'
    try {
      const img = sharp(originalBuffer, { failOn: 'error' })
      const metadata = await img.metadata()
      if (!metadata.format) {
        return NextResponse.json({ message: 'Imagen inválida' }, { status: 400 })
      }
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
    const fileName = `product-${session.user.id}-${generateUniqueId()}.${outputExtension}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, processedBuffer)

    // Generar URL relativa
    const imageUrl = `/uploads/product-images/${fileName}`

    return NextResponse.json({ 
      message: 'Imagen subida correctamente',
      imageUrl 
    })

  } catch (error) {
    console.error('Error uploading product image:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
