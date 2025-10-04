import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Crear nuevo pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderNumber,
      customerName,
      customerWhatsApp,
      customerEmail,
      deliveryMethod,
      paymentMethod,
      address,
      items,
      subtotal,
      deliveryFee,
      total,
      amountPaid,
      change,
      observations,
      storeSlug
    } = body

    // Validar datos requeridos
    if (!orderNumber || !customerName || !customerWhatsApp || !items || !total) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos del pedido' },
        { status: 400 }
      )
    }

    // Buscar la tienda por slug
    const store = await prisma.storeSettings.findUnique({
      where: { storeSlug },
      include: { user: true }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Crear pedido usando transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el pedido
      const order = await tx.order.create({
        data: {
          status: 'PENDING',
          total: total,
          customerEmail: customerEmail || null,
          customerName: customerName,
          notes: observations || null,
          userId: store.userId
        }
      })

      // Crear items del pedido
      const orderItems = await Promise.all(
        items.map((item: any) =>
          tx.orderItem.create({
            data: {
              quantity: item.quantity,
              price: item.price,
              variantName: item.variantName || null,
              orderId: order.id,
              productId: item.id
            }
          })
        )
      )

      return { order, orderItems }
    })

    // Preparar datos de respuesta
    const orderData = {
      id: result.order.id,
      orderNumber,
      status: result.order.status,
      customerName,
      customerWhatsApp,
      customerEmail,
      deliveryMethod,
      paymentMethod,
      address,
      items: result.orderItems,
      subtotal,
      deliveryFee,
      total,
      amountPaid,
      change,
      observations,
      createdAt: result.order.createdAt,
      storeInfo: {
        storeName: store.storeName,
        storeSlug: store.storeSlug,
        whatsappMainNumber: store.whatsappMainNumber
      }
    }

    console.log('✅ Pedido creado:', {
      orderId: result.order.id,
      orderNumber,
      customerName,
      total,
      itemsCount: result.orderItems.length
    })

    return NextResponse.json({
      success: true,
      message: 'Pedido creado exitosamente',
      order: orderData
    })

  } catch (error) {
    console.error('❌ Error creating order:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Obtener pedidos de una tienda
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeSlug = searchParams.get('storeSlug')
    const status = searchParams.get('status')

    if (!storeSlug) {
      return NextResponse.json(
        { error: 'Store slug es requerido' },
        { status: 400 }
      )
    }

    // Buscar la tienda
    const store = await prisma.storeSettings.findUnique({
      where: { storeSlug },
      include: { user: true }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Construir filtros
    const where: any = {
      userId: store.userId
    }

    if (status) {
      where.status = status
    }

    // Obtener pedidos
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limitar a 50 pedidos recientes
    })

    // Formatear respuesta
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: `ORD-${order.id.slice(-6)}`,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: order.total,
      itemsCount: order.items.length,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        variantName: item.variantName
      }))
    }))

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      total: orders.length
    })

  } catch (error) {
    console.error('❌ Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
