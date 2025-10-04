import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

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

    // Validar tipo de archivo
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Solo se permiten archivos de imagen' }, { status: 400 })
    }

    // Validar tamaño (máximo 10MB para productos)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'La imagen es demasiado grande. Máximo 10MB' }, { status: 400 })
    }

    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'product-images')
    await mkdir(uploadsDir, { recursive: true })

    // Generar nombre único para el archivo
    const fileExtension = image.name.split('.').pop() || 'jpg'
    const fileName = `product-${session.user.id}-${generateUniqueId()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convertir File a Buffer y guardar
    const buffer = Buffer.from(await image.arrayBuffer())
    await writeFile(filePath, buffer)

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
