import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cliente: string }> }
) {
  try {
    console.log('🔍 API /tienda/[cliente] called')
    const { cliente } = await params
    console.log('🔍 Cliente parameter:', cliente)
    
    // Buscar la tienda por slug o ID (sin filtrar por storeActive)
    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        OR: [
          { storeSlug: cliente },
          { id: cliente }
        ]
      },
      select: {
        id: true,
        storeName: true,
        storeSlug: true,
        email: true,
        address: true,
        whatsappMainNumber: true,
        country: true,
        currency: true,
        deliveryEnabled: true,
        useBasePrice: true,
        baseDeliveryPrice: true,
        baseDeliveryThreshold: true,
        deliveryScheduleEnabled: true,
        scheduleType: true,
        advanceDays: true,
        serviceHours: true,
        unifiedSchedule: true,
        enableBusinessHours: true,
        storeActive: true,
        passwordProtected: true,
        accessPassword: true,
        bannerImage: true,
        profileImage: true,
        // Campos para validar estado
        user: {
          select: {
            isSuspended: true,
            isActive: true
          }
        }
      }
    })

    // Tienda no existe
    if (!storeSettings) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Usuario suspendido
    if (storeSettings.user.isSuspended) {
      return NextResponse.json(
        {
          error: 'Tienda no disponible',
          reason: 'suspended',
          storeName: storeSettings.storeName
        },
        { status: 403 }
      )
    }

    // Usuario inactivo
    if (!storeSettings.user.isActive) {
      return NextResponse.json(
        {
          error: 'Tienda no disponible',
          reason: 'inactive',
          storeName: storeSettings.storeName
        },
        { status: 403 }
      )
    }

    // Tienda inactiva
    if (!storeSettings.storeActive) {
      return NextResponse.json(
        {
          error: 'Tienda no disponible',
          reason: 'inactive',
          storeName: storeSettings.storeName
        },
        { status: 403 }
      )
    }

    console.log('🔍 Store settings from DB:', {
      id: storeSettings.id,
      storeName: storeSettings.storeName,
      bannerImage: storeSettings.bannerImage,
      profileImage: storeSettings.profileImage,
      enableBusinessHours: storeSettings.enableBusinessHours,
      unifiedSchedule: storeSettings.unifiedSchedule
    })

    // Parsear campos JSON
    const parsedStoreInfo = {
      ...storeSettings,
      address: storeSettings.address ? (() => {
        try {
          return JSON.parse(storeSettings.address as string)
        } catch {
          return null
        }
      })() : null,
      serviceHours: storeSettings.serviceHours ? (() => {
        try {
          return JSON.parse(storeSettings.serviceHours as string)
        } catch {
          return {}
        }
      })() : {},
      unifiedSchedule: storeSettings.unifiedSchedule ? (() => {
        try {
          // Si ya es un objeto, devolverlo directamente
          if (typeof storeSettings.unifiedSchedule === 'object') {
            return storeSettings.unifiedSchedule
          }
          // Si es string, parsearlo
          return JSON.parse(storeSettings.unifiedSchedule as string)
        } catch (error) {
          console.error('Error parsing unifiedSchedule:', error)
          return {}
        }
      })() : {}
    }

    console.log('🔍 Store images:', {
      bannerImage: storeSettings.bannerImage,
      profileImage: storeSettings.profileImage
    })

    console.log('🔍 Parsed store info:', {
      enableBusinessHours: parsedStoreInfo.enableBusinessHours,
      unifiedSchedule: parsedStoreInfo.unifiedSchedule,
      serviceHours: parsedStoreInfo.serviceHours
    })

    return NextResponse.json(parsedStoreInfo)
  } catch (error) {
    console.error('Error loading store info:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
