import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
    const type = formData.get('type') as string

    if (!image || !type) {
      return NextResponse.json({ message: 'Imagen y tipo requeridos' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Solo se permiten archivos de imagen' }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'La imagen es demasiado grande. Máximo 5MB' }, { status: 400 })
    }

    // Usar el sistema de storage multi-provider
    const storage = await getStorageProvider()
    const userId = session.user.id

    // Determinar el path según el tipo
    const path = type === 'banner' ? 'banners' : 'profile'
    const uploadResult = await storage.upload(image, `store-${userId}/${path}`)

    const imageUrl = uploadResult.url

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
      url: uploadResult.url,
      size: uploadResult.size
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
