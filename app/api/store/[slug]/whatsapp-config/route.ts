import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener configuración de WhatsApp para una tienda
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Buscar la tienda por slug
    const store = await prisma.storeSettings.findUnique({
      where: { storeSlug: slug },
      select: {
        whatsappMainNumber: true,
        // TODO: whatsappSequentialNumbers field missing from schema
        // whatsappSequentialNumbers: true,
        storeActive: true
      }
    })

    if (!store) {
      return NextResponse.json({ message: 'Tienda no encontrada' }, { status: 404 })
    }

    if (!store.storeActive) {
      return NextResponse.json({ message: 'Tienda no disponible' }, { status: 403 })
    }

    // TODO: Parsear números secuenciales cuando el campo exista en schema
    // const parsedSequentialNumbers = store.whatsappSequentialNumbers ?
    //   (() => {
    //     try {
    //       return JSON.parse(store.whatsappSequentialNumbers)
    //     } catch {
    //       return []
    //     }
    //   })() : []

    return NextResponse.json({
      whatsappMainNumber: store.whatsappMainNumber,
      // whatsappSequentialNumbers: parsedSequentialNumbers
    })
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
