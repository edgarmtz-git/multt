import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Endpoint público para tracking de órdenes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Buscar pedido por ID de base de datos O por orderNumber
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            },
            variant: {
              select: {
                name: true
              }
            },
            options: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Formatear respuesta (sin datos sensibles del usuario)
    const response = {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        deliveryMethod: order.deliveryMethod,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        trackingUrl: order.trackingUrl,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item: any) => ({
          id: item.id,
          productName: item.product.name,
          productImage: item.product.imageUrl,
          quantity: item.quantity,
          price: item.price,
          variantName: item.variant?.name || null,
          options: item.options.map((opt: any) => ({
            name: opt.optionName || opt.choiceName,
            price: opt.price
          }))
        }))
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching order for tracking:', error)
    return NextResponse.json(
      { error: 'Error al obtener información del pedido' },
      { status: 500 }
    )
  }
}
