import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStorageProvider } from '@/lib/storage'

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

    // Usar el sistema de storage multi-provider
    const storage = await getStorageProvider()
    const userId = session.user.id
    const uploadResult = await storage.upload(image, `store-${userId}/products`)

    const imageUrl = uploadResult.url

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
