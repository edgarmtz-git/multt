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
    
    // Buscar la tienda por slug o ID
    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        OR: [
          { storeSlug: cliente },
          { id: cliente }
        ],
        storeActive: true
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
        storeActive: true,
        passwordProtected: true,
        accessPassword: true,
        // Campos de imágenes
        bannerImage: true,
        profileImage: true
      }
    })

    if (!storeSettings) {
      return NextResponse.json(
        { message: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    console.log('🔍 Store settings from DB:', {
      id: storeSettings.id,
      storeName: storeSettings.storeName,
      bannerImage: storeSettings.bannerImage,
      profileImage: storeSettings.profileImage
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
          return JSON.parse(storeSettings.unifiedSchedule as string)
        } catch {
          return {}
        }
      })() : {}
    }

    console.log('🔍 Store images:', {
      bannerImage: storeSettings.bannerImage,
      profileImage: storeSettings.profileImage
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
