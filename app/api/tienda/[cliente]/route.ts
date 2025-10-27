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

    // Buscar la tienda por slug
    const store = await prisma.storeSettings.findFirst({
      where: {
        storeSlug: cliente
      },
      include: {
        user: {
          select: {
            isActive: true,
            isSuspended: true
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Verificar usuario activo
    if (!store.user.isActive || store.user.isSuspended) {
      return NextResponse.json(
        { error: 'Tienda no disponible' },
        { status: 403 }
      )
    }

    // Buscar categorías activas
    const categories = await prisma.category.findMany({
      where: {
        userId: store.userId,
        isActive: true,
        isVisibleInStore: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Buscar productos activos con sus relaciones
    const products = await prisma.product.findMany({
      where: {
        userId: store.userId,
        isActive: true
      },
      include: {
        variants: {
          where: { isActive: true }
        },
        options: {
          include: {
            choices: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          }
        },
        categoryProducts: {
          include: {
            category: true
          }
        }
      }
    })

    // Response
    const response = NextResponse.json({
      store: {
        id: store.id,
        storeName: store.storeName,
        storeSlug: store.storeSlug,
        storeActive: store.storeActive,
        whatsappMainNumber: store.whatsappMainNumber,
        country: store.country,
        currency: store.currency,
        deliveryEnabled: store.deliveryEnabled,
        cashPaymentEnabled: store.cashPaymentEnabled,
        bankTransferEnabled: store.bankTransferEnabled
      },
      categories,
      products
    })

    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return response

  } catch (error) {
    console.error('Error loading store:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    )
  }
}
