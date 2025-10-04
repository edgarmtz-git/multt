import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener configuración de contacto para una tienda
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Buscar la tienda por slug
    const store = await prisma.storeSettings.findUnique({
      where: { storeSlug: slug },
      select: {
        whatsappMainNumber: true,
        phoneNumber: true,
        storeActive: true
      }
    })

    if (!store) {
      return NextResponse.json({ message: 'Tienda no encontrada' }, { status: 404 })
    }

    if (!store.storeActive) {
      return NextResponse.json({ message: 'Tienda no disponible' }, { status: 403 })
    }

    return NextResponse.json({
      whatsappMainNumber: store.whatsappMainNumber,
      phoneNumber: store.phoneNumber
    })
  } catch (error) {
    console.error('Error fetching contact config:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
