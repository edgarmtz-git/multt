import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserSlug } from '@/lib/get-user-slug'

// GET - Obtener zonas de entrega del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Buscar configuración de la tienda del usuario
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { userId: session.user.id },
      include: {
        deliveryZones: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!storeSettings) {
      return NextResponse.json({ deliveryZones: [] })
    }

    // Transformar los datos para el frontend
    const deliveryZones = storeSettings.deliveryZones.map(zone => ({
      ...zone
    }))

    return NextResponse.json({ deliveryZones })
  } catch (error) {
    console.error('Error al obtener zonas de entrega:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva zona de entrega
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      type,
      isActive,
      order,
      fixedPrice,
      freeDeliveryThreshold,
      estimatedTime,
      description
    } = body

    // Validar datos requeridos
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nombre y tipo son obligatorios' },
        { status: 400 }
      )
    }

    // Buscar o crear configuración de la tienda
    let storeSettings = await prisma.storeSettings.findUnique({
      where: { userId: session.user.id }
    })

    if (!storeSettings) {
      // Obtener slug correcto desde invitación o generar uno apropiado
      const slug = await getUserSlug(session.user.id, session.user.email!)

      storeSettings = await prisma.storeSettings.create({
        data: {
          userId: session.user.id,
          storeName: 'Mi Tienda',
          storeSlug: slug,
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
          passwordProtected: false
        }
      })

      console.log('✅ Auto-created StoreSettings with proper slug:', slug)
    }

    // Crear la zona de entrega
    const deliveryZone = await prisma.deliveryZone.create({
      data: {
        name,
        type,
        isActive: isActive ?? true,
        order: order ?? 0,
        fixedPrice: fixedPrice ?? null,
        freeDeliveryThreshold: freeDeliveryThreshold ?? null,
        estimatedTime: estimatedTime ?? null,
        description: description ?? null,
        storeSettingsId: storeSettings.id
      }
    })

    return NextResponse.json({ 
      deliveryZone: {
        ...deliveryZone
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear zona de entrega:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
