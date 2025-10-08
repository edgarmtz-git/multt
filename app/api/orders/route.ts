import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { orderSchema } from '@/lib/validation'
import { ZodError } from 'zod'

// POST - Crear nuevo pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar con Zod
    const validationResult = orderSchema.safeParse({
      customerName: body.customerName,
      customerWhatsApp: body.customerWhatsApp,
      customerEmail: body.customerEmail,
      deliveryMethod: body.deliveryMethod,
      paymentMethod: body.paymentMethod,
      address: body.address,
      items: body.items,
      subtotal: body.subtotal,
      deliveryFee: body.deliveryFee,
      total: body.total,
      observations: body.observations
    })

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const {
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
      observations
    } = validationResult.data

    const { orderNumber, amountPaid, change, storeSlug } = body

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

    // Validar que la tienda esté activa
    if (!store.storeActive) {
      return NextResponse.json(
        { error: 'Tienda no disponible en este momento' },
        { status: 403 }
      )
    }

    // Crear pedido usando transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el pedido con TODOS los campos
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          total,
          subtotal: subtotal || null,
          deliveryFee: deliveryFee || 0,
          customerName,
          customerEmail: customerEmail || null,
          customerWhatsApp,
          deliveryMethod,
          address: address || null,
          paymentMethod,
          amountPaid: amountPaid || null,
          change: change || null,
          notes: observations || null,
          trackingUrl: `/tracking/order/${orderNumber}`,
          userId: store.userId
        }
      })

      // Crear items del pedido CON opciones
      const orderItems = await Promise.all(
        items.map(async (item: any) => {
          const orderItem = await tx.orderItem.create({
            data: {
              quantity: item.quantity,
              price: item.price,
              variantName: item.variantName || null,
              orderId: order.id,
              productId: item.id,
              variantId: item.variantId || null
            }
          })

          // Guardar opciones seleccionadas si existen
          if (item.options && Array.isArray(item.options) && item.options.length > 0) {
            await tx.orderItemOption.createMany({
              data: item.options.map((opt: any) => ({
                orderItemId: orderItem.id,
                optionName: opt.optionName || 'Opción',
                choiceName: opt.choiceName || opt.name,
                price: opt.price || 0,
                quantity: opt.quantity || 1
              }))
            })
          }

          return orderItem
        })
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
            variant: true,
            options: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limitar a 50 pedidos recientes
    })

    // Formatear respuesta
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerWhatsApp: order.customerWhatsApp,
      deliveryMethod: order.deliveryMethod,
      paymentMethod: order.paymentMethod,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      itemsCount: order.items.length,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        variantName: item.variantName,
        options: item.options
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
