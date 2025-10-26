import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { orderSchema } from '@/lib/validation'
import { handleError, Errors, withErrorHandler } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
import type { CreateOrderRequest, ApiResponse } from '@/types/api'

// POST - Crear nuevo pedido
export const POST = withErrorHandler(async (request: NextRequest) => {
  const startTime = Date.now()
  const body = await request.json()

  logger.apiRequest('POST', '/api/orders', {
    storeSlug: body.storeSlug,
    itemsCount: body.items?.length
  })

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
    logger.warn('Order validation failed', {
      errors: validationResult.error.issues,
      storeSlug: body.storeSlug
    })
    throw Errors.validation(`Datos de pedido inválidos: ${validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`)
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
      logger.warn('Store not found', { storeSlug })
      throw Errors.notFound('Tienda no encontrada')
    }

    // Validar que la tienda esté activa
    if (!store.storeActive) {
      logger.warn('Store not active', { storeSlug, storeName: store.storeName })
      throw Errors.forbidden('Tienda no disponible en este momento')
    }

    logger.businessLogic('Creating order', {
      storeSlug,
      storeName: store.storeName,
      customerName,
      total
    })

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

    // Preparar datos de respuesta - Fixed
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

    const duration = Date.now() - startTime
    logger.performance('Order creation', duration, {
      orderId: result.order.id,
      storeSlug,
      total
    })

    logger.apiResponse('POST', '/api/orders', 200, {
      orderId: result.order.id,
      storeSlug
    })

    return NextResponse.json({
      success: true,
      message: 'Pedido creado exitosamente',
      order: orderData
    })
})

// NOTA: El endpoint GET fue eliminado por razones de seguridad.
// No se usaba en el frontend y permitía acceso no autenticado a órdenes.
// Para obtener órdenes, usar: /app/dashboard/orders/page.tsx que consulta directamente la BD
// Para tracking público, usar: /api/orders/[id] que requiere el ID específico de la orden
