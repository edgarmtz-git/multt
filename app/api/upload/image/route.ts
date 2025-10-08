// API endpoint universal para upload de imágenes
// Funciona con cualquier storage provider configurado

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStorageProvider } from '@/lib/storage'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener FormData
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const path = formData.get('path') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      )
    }

    // Construir path con aislamiento multi-tenant
    // Formato: store-{userId}/{category}
    const userId = session.user.id
    const fullPath = `store-${userId}/${path || 'general'}`

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      )
    }

    // Obtener provider configurado y subir con path multi-tenant
    const storage = await getStorageProvider()
    const result = await storage.upload(file, fullPath)

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Error al subir imagen' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener key del query string
    const searchParams = req.nextUrl.searchParams
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'No se proporcionó key' },
        { status: 400 }
      )
    }

    // 🔒 SEGURIDAD: Validar que el archivo pertenece al usuario
    const userId = session.user.id
    const expectedPrefix = `store-${userId}/`

    if (!key.startsWith(expectedPrefix)) {
      console.warn(`Intento de eliminar archivo de otro usuario: ${session.user.email} intentó eliminar ${key}`)
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este archivo' },
        { status: 403 }
      )
    }

    // Obtener provider configurado y eliminar
    const storage = await getStorageProvider()
    await storage.delete(key)

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada'
    })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Error al eliminar imagen' },
      { status: 500 }
    )
  }
}
