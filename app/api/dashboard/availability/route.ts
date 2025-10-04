import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener horarios de disponibilidad
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const storeSettings = await prisma.storeSettings.findFirst({
      where: { userId: session.user.id },
      select: {
        storeName: true,
        unifiedSchedule: true
      }
    })

    // Configuración por defecto si no existe
    const defaultSchedule = {
      operatingHours: {
        monday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
        tuesday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
        wednesday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
        thursday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
        friday: { isOpen: true, periods: [{ open: "09:00", close: "23:00" }] },
        saturday: { isOpen: true, periods: [{ open: "10:00", close: "23:00" }] },
        sunday: { isOpen: true, periods: [{ open: "11:00", close: "21:00" }] }
      },
      deliveryOptions: {
        enabled: true,
        immediate: true,
        scheduled: true,
        pickup: true,
        minAdvanceHours: 1,
        maxAdvanceDays: 7,
        useOperatingHours: true
      },
      exceptions: []
    }

    // Parsear unifiedSchedule si es string, o usar defaultSchedule si no existe
    let unifiedSchedule = defaultSchedule
    if (storeSettings?.unifiedSchedule) {
      try {
        unifiedSchedule = typeof storeSettings.unifiedSchedule === 'string' 
          ? JSON.parse(storeSettings.unifiedSchedule) 
          : storeSettings.unifiedSchedule
      } catch (error) {
        console.error('Error parsing unifiedSchedule:', error)
      }
    }

    return NextResponse.json({
      storeName: storeSettings?.storeName || 'Mi Tienda',
      unifiedSchedule
    })
  } catch (error) {
    console.error('Error al obtener horarios:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar horarios de disponibilidad
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { unifiedSchedule } = body

    console.log('🔍 PUT /api/dashboard/availability - unifiedSchedule:', JSON.stringify(unifiedSchedule, null, 2))

    // Validar que unifiedSchedule sea un objeto válido
    if (!unifiedSchedule || typeof unifiedSchedule !== 'object') {
      return NextResponse.json(
        { message: 'Horarios inválidos' },
        { status: 400 }
      )
    }

    // Actualizar o crear la configuración de la tienda
    const updatedSettings = await prisma.storeSettings.upsert({
      where: { userId: session.user.id },
      update: {
        unifiedSchedule: JSON.stringify(unifiedSchedule)
      },
      create: {
        userId: session.user.id,
        storeName: 'Mi Tienda',
        storeSlug: `tienda-${Date.now()}`,
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
        storeActive: true,
        passwordProtected: false,
        unifiedSchedule: JSON.stringify(unifiedSchedule)
      }
    })

    console.log('✅ Horarios actualizados exitosamente')

    return NextResponse.json({
      message: 'Horarios actualizados exitosamente',
      unifiedSchedule
    })
  } catch (error) {
    console.error('Error al actualizar horarios:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
