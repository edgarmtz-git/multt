import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache de 60 segundos
export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cliente: string }> }
) {
  try {
    const { cliente } = await params
    
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
        whatsappMainNumber: true,
        country: true,
        currency: true,
        deliveryEnabled: true,
        useBasePrice: true,
        baseDeliveryPrice: true,
        baseDeliveryThreshold: true,
        enableBusinessHours: true,
        storeActive: true,
        passwordProtected: true,
        unifiedSchedule: true,
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

    // Parsear campos JSON
    const parsedStoreInfo = {
      ...storeSettings,
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

    // Headers de cache HTTP
    const response = NextResponse.json(parsedStoreInfo)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')

    return response
  } catch (error) {
    console.error('Error loading store info:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
