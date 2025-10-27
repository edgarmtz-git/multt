import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Store slug is required' }, { status: 400 })
    }

    // Buscar la tienda por slug e incluir zonas activas
    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeSlug: slug
      },
      include: {
        deliveryZones: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!storeSettings) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const deliveryZones = storeSettings.deliveryZones.map((zone: any) => ({
      id: zone.id,
      name: zone.name,
      type: zone.type,
      fixedPrice: zone.fixedPrice,
      freeDeliveryThreshold: zone.freeDeliveryThreshold,
      estimatedTime: zone.estimatedTime,
      description: zone.description,
      order: zone.order
    }))

    return NextResponse.json({ deliveryZones })

  } catch (error) {
    console.error('Error fetching delivery zones:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
