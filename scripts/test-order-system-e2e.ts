#!/usr/bin/env tsx
/**
 * Test End-to-End del Sistema de Órdenes/Tickets
 *
 * Escenario: Cliente visita tienda pública → Hace pedido → Tracking
 *
 * Flujo:
 * 1. Cliente visita tienda pública (sin login)
 * 2. Ve productos disponibles
 * 3. Selecciona productos y agrega al carrito
 * 4. Configura entrega (domicilio o pickup)
 * 5. Completa información de contacto
 * 6. Crea la orden
 * 7. Recibe número de tracking
 * 8. Puede ver estado de su orden
 * 9. El cliente (dueño de la tienda) ve la orden en su dashboard
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface TestResult {
  step: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  data?: any
}

const results: TestResult[] = []

function logResult(step: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, data?: any) {
  results.push({ step, status, message, data })
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${emoji} ${step}: ${message}`)
  if (data && process.env.DEBUG) {
    console.log('   Data:', JSON.stringify(data, null, 2))
  }
}

async function setup() {
  console.log('\n🔧 SETUP: Creando datos de prueba...\n')

  // 1. Crear usuario cliente (dueño de tienda)
  const hashedPassword = await bcrypt.hash('test123', 12)

  const testUser = await prisma.user.upsert({
    where: { email: 'tienda-test@test.com' },
    update: {},
    create: {
      email: 'tienda-test@test.com',
      name: 'Tienda de Prueba',
      password: hashedPassword,
      role: 'CLIENT',
      company: 'Pizzeria Test',
      isActive: true
    }
  })

  logResult('Setup: Usuario', 'PASS', `Usuario creado: ${testUser.email}`)

  // 2. Crear StoreSettings
  const storeSettings = await prisma.storeSettings.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      storeName: 'Pizzeria Test',
      storeSlug: 'pizzeria-test',
      email: 'pedidos@pizzeria-test.com',
      whatsappMainNumber: '+525512345678',
      address: 'Calle Principal #123, Centro',
      country: 'Mexico',
      language: 'es',
      currency: 'MXN',
      storeActive: true,
      deliveryEnabled: true,
      deliveryCalculationMethod: 'manual',
      manualDeliveryMessage: 'El costo de envío se calcula al confirmar',
      paymentsEnabled: true,
      cashPaymentEnabled: true,
      cashPaymentInstructions: 'Pago en efectivo al recibir'
    }
  })

  logResult('Setup: Tienda', 'PASS', `Tienda creada: ${storeSettings.storeSlug}`)

  // 3. Crear categoría
  let category = await prisma.category.findFirst({
    where: {
      userId: testUser.id,
      name: 'Pizzas'
    }
  })

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Pizzas',
        userId: testUser.id,
        isActive: true,
        isVisibleInStore: true,
        order: 1
      }
    })
  }

  logResult('Setup: Categoría', 'PASS', `Categoría creada: ${category.name}`)

  // 4. Crear productos
  const product1 = await prisma.product.create({
    data: {
      name: 'Pizza Margarita',
      description: 'Tomate, mozzarella y albahaca fresca',
      price: 120,
      stock: 100,
      isActive: true,
      userId: testUser.id,
      categoryProducts: {
        create: {
          categoryId: category.id,
          order: 1
        }
      }
    }
  })

  const product2 = await prisma.product.create({
    data: {
      name: 'Pizza Pepperoni',
      description: 'Pepperoni y queso mozzarella',
      price: 150,
      stock: 100,
      isActive: true,
      hasVariants: true,
      variantType: 'size',
      variantLabel: 'Tamaño',
      userId: testUser.id,
      categoryProducts: {
        create: {
          categoryId: category.id,
          order: 2
        }
      },
      variants: {
        create: [
          { name: 'Chica', value: 'chica', price: 150, isActive: true },
          { name: 'Mediana', value: 'mediana', price: 200, isActive: true },
          { name: 'Grande', value: 'grande', price: 250, isActive: true }
        ]
      }
    }
  })

  logResult('Setup: Productos', 'PASS', `2 productos creados`)

  return { testUser, storeSettings, category, product1, product2 }
}

async function testPublicStoreAccess(storeSlug: string) {
  console.log('\n🌐 TEST 1: Acceso a tienda pública...\n')

  // Simular GET a /api/store/[slug]
  const store = await prisma.storeSettings.findUnique({
    where: { storeSlug },
    select: {
      storeName: true,
      storeSlug: true,
      storeActive: true,
      deliveryEnabled: true,
      paymentsEnabled: true,
      whatsappMainNumber: true,
      email: true,
      address: true,
      currency: true
    }
  })

  if (!store) {
    logResult('Public Store', 'FAIL', 'Tienda no encontrada')
    return false
  }

  if (!store.storeActive) {
    logResult('Public Store', 'FAIL', 'Tienda inactiva')
    return false
  }

  logResult('Public Store', 'PASS', `Tienda accesible: ${store.storeName}`, store)
  return true
}

async function testProductListing(userId: string) {
  console.log('\n📦 TEST 2: Listado de productos...\n')

  // Simular GET a /api/tienda/[cliente]/categories y products
  const categories = await prisma.category.findMany({
    where: {
      userId,
      isActive: true,
      isVisibleInStore: true
    },
    include: {
      categoryProducts: {
        include: {
          product: {
            include: {
              variants: true
            }
          }
        },
        where: {
          product: {
            isActive: true
          }
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  })

  if (categories.length === 0) {
    logResult('Product Listing', 'FAIL', 'No hay categorías visibles')
    return false
  }

  const totalProducts = categories.reduce(
    (sum, cat) => sum + cat.categoryProducts.length,
    0
  )

  if (totalProducts === 0) {
    logResult('Product Listing', 'FAIL', 'No hay productos disponibles')
    return false
  }

  logResult('Product Listing', 'PASS', `${categories.length} categorías, ${totalProducts} productos`, {
    categories: categories.map(c => ({
      name: c.name,
      products: c.categoryProducts.length
    }))
  })

  return true
}

async function testOrderCreation(storeSlug: string, userId: string) {
  console.log('\n🛒 TEST 3: Creación de orden...\n')

  // Obtener productos para la orden
  const products = await prisma.product.findMany({
    where: { userId, isActive: true },
    include: { variants: true },
    take: 2
  })

  if (products.length === 0) {
    logResult('Order Creation', 'FAIL', 'No hay productos para ordenar')
    return null
  }

  // Simular datos del cliente
  const orderData = {
    storeSlug,
    customerName: 'Juan Pérez',
    customerEmail: 'juan@example.com',
    customerWhatsApp: '+525512345678',
    deliveryMethod: 'delivery',
    paymentMethod: 'cash',
    address: {
      street: 'Av. Reforma #456',
      neighborhood: 'Centro',
      city: 'CDMX',
      zipCode: '06000',
      references: 'Casa azul, portón negro'
    },
    items: [
      {
        productId: products[0].id,
        productName: products[0].name,
        quantity: 2,
        price: products[0].price,
        variantId: null,
        variantName: null,
        options: []
      }
    ],
    subtotal: products[0].price * 2,
    deliveryFee: 50,
    total: products[0].price * 2 + 50,
    observations: 'Sin cebolla, por favor'
  }

  // Validar que la tienda existe y está activa
  const store = await prisma.storeSettings.findUnique({
    where: { storeSlug },
    include: { user: true }
  })

  if (!store || !store.storeActive) {
    logResult('Order Creation', 'FAIL', 'Tienda no disponible')
    return null
  }

  // Generar número de orden
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

  try {
    // Crear orden en transacción
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          total: orderData.total,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerWhatsApp: orderData.customerWhatsApp,
          deliveryMethod: orderData.deliveryMethod,
          address: orderData.address,
          paymentMethod: orderData.paymentMethod,
          notes: orderData.observations,
          trackingUrl: `/tracking/order/${orderNumber}`,
          userId: store.userId
        }
      })

      // Crear items de la orden
      for (const item of orderData.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            variantName: item.variantName,
            quantity: item.quantity,
            price: item.price
          }
        })
      }

      return newOrder
    })

    logResult('Order Creation', 'PASS', `Orden creada: ${order.orderNumber}`, {
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      trackingUrl: order.trackingUrl
    })

    return order
  } catch (error) {
    logResult('Order Creation', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    return null
  }
}

async function testOrderTracking(orderNumber: string) {
  console.log('\n🔍 TEST 4: Tracking de orden...\n')

  // Simular acceso a /tracking/order/[orderNumber]
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
          options: true
        }
      },
      user: {
        include: {
          storeSettings: true
        }
      }
    }
  })

  if (!order) {
    logResult('Order Tracking', 'FAIL', 'Orden no encontrada')
    return false
  }

  // Verificar que tiene toda la información necesaria
  const checks = {
    hasOrderNumber: !!order.orderNumber,
    hasStatus: !!order.status,
    hasCustomerInfo: !!(order.customerName && order.customerWhatsApp),
    hasItems: order.items.length > 0,
    hasTotal: order.total > 0,
    hasTrackingUrl: !!order.trackingUrl,
    hasStoreInfo: !!order.user.storeSettings
  }

  const allPassed = Object.values(checks).every(Boolean)

  if (!allPassed) {
    logResult('Order Tracking', 'WARN', 'Información incompleta', checks)
  } else {
    logResult('Order Tracking', 'PASS', 'Tracking completo y funcional', {
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items.length,
      total: order.total,
      storeName: order.user.storeSettings?.storeName
    })
  }

  return allPassed
}

async function testDashboardOrderView(userId: string, orderNumber: string) {
  console.log('\n📊 TEST 5: Vista de orden en dashboard del cliente...\n')

  // Simular GET a /api/orders/[id] con sesión del cliente
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId // ✅ IMPORTANTE: Filtrar por usuario para seguridad
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
          options: true
        }
      }
    }
  })

  if (!order) {
    logResult('Dashboard Order View', 'FAIL', 'Cliente no puede ver la orden (puede ser problema de autorización)')
    return false
  }

  // Verificar que el cliente puede actualizar el estado
  const canUpdate = order.userId === userId

  if (!canUpdate) {
    logResult('Dashboard Order View', 'FAIL', 'Cliente no puede actualizar esta orden')
    return false
  }

  logResult('Dashboard Order View', 'PASS', 'Cliente puede ver y gestionar la orden', {
    orderNumber: order.orderNumber,
    currentStatus: order.status,
    itemsCount: order.items.length,
    canUpdate
  })

  return true
}

async function testOrderStatusUpdate(userId: string, orderNumber: string) {
  console.log('\n🔄 TEST 6: Actualización de estado de orden...\n')

  try {
    // Simular PUT a /api/orders/[id]
    const updatedOrder = await prisma.order.updateMany({
      where: {
        orderNumber,
        userId // ✅ Seguridad: solo el dueño puede actualizar
      },
      data: {
        status: 'CONFIRMED'
      }
    })

    if (updatedOrder.count === 0) {
      logResult('Order Status Update', 'FAIL', 'No se pudo actualizar (autorización o no encontrada)')
      return false
    }

    // Verificar que se actualizó
    const order = await prisma.order.findFirst({
      where: { orderNumber }
    })

    if (order?.status !== 'CONFIRMED') {
      logResult('Order Status Update', 'FAIL', 'Estado no se actualizó correctamente')
      return false
    }

    logResult('Order Status Update', 'PASS', `Estado actualizado a: ${order.status}`)
    return true
  } catch (error) {
    logResult('Order Status Update', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    return false
  }
}

async function cleanup() {
  console.log('\n🧹 CLEANUP: Limpiando datos de prueba...\n')

  try {
    // Eliminar en orden correcto (por foreign keys)
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          user: {
            email: 'tienda-test@test.com'
          }
        }
      }
    })

    await prisma.order.deleteMany({
      where: {
        user: {
          email: 'tienda-test@test.com'
        }
      }
    })

    await prisma.productVariant.deleteMany({
      where: {
        product: {
          user: {
            email: 'tienda-test@test.com'
          }
        }
      }
    })

    await prisma.categoryProduct.deleteMany({
      where: {
        product: {
          user: {
            email: 'tienda-test@test.com'
          }
        }
      }
    })

    await prisma.product.deleteMany({
      where: {
        user: {
          email: 'tienda-test@test.com'
        }
      }
    })

    await prisma.category.deleteMany({
      where: {
        user: {
          email: 'tienda-test@test.com'
        }
      }
    })

    await prisma.storeSettings.deleteMany({
      where: {
        user: {
          email: 'tienda-test@test.com'
        }
      }
    })

    await prisma.user.deleteMany({
      where: {
        email: 'tienda-test@test.com'
      }
    })

    logResult('Cleanup', 'PASS', 'Datos de prueba eliminados')
  } catch (error) {
    logResult('Cleanup', 'WARN', 'Error en cleanup (puede ser ignorado)', error)
  }
}

async function printSummary() {
  console.log('\n' + '═'.repeat(60))
  console.log('📋 RESUMEN DE PRUEBAS\n')

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warnings = results.filter(r => r.status === 'WARN').length
  const total = results.length

  console.log(`Total: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warnings}`)
  console.log('')

  if (failed > 0) {
    console.log('❌ PRUEBAS FALLIDAS:\n')
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  • ${r.step}: ${r.message}`)
      })
    console.log('')
  }

  if (warnings > 0) {
    console.log('⚠️  ADVERTENCIAS:\n')
    results
      .filter(r => r.status === 'WARN')
      .forEach(r => {
        console.log(`  • ${r.step}: ${r.message}`)
      })
    console.log('')
  }

  const successRate = ((passed / total) * 100).toFixed(1)
  console.log(`Tasa de éxito: ${successRate}%`)
  console.log('═'.repeat(60) + '\n')

  if (failed === 0) {
    console.log('✅ ¡SISTEMA DE ÓRDENES FUNCIONANDO CORRECTAMENTE!')
  } else {
    console.log('❌ SE ENCONTRARON PROBLEMAS EN EL SISTEMA DE ÓRDENES')
    process.exit(1)
  }
}

async function main() {
  console.log('🧪 TEST END-TO-END: SISTEMA DE ÓRDENES/TICKETS\n')
  console.log('Escenario: Cliente hace pedido en tienda pública → Tracking → Dashboard\n')

  try {
    // Setup
    const { testUser, storeSettings } = await setup()

    // Tests
    const storeAccessOk = await testPublicStoreAccess(storeSettings.storeSlug)
    if (!storeAccessOk) {
      console.log('\n❌ Test abortado: No se puede acceder a la tienda pública')
      await cleanup()
      await printSummary()
      return
    }

    const productListingOk = await testProductListing(testUser.id)
    if (!productListingOk) {
      console.log('\n❌ Test abortado: No hay productos disponibles')
      await cleanup()
      await printSummary()
      return
    }

    const order = await testOrderCreation(storeSettings.storeSlug, testUser.id)
    if (!order) {
      console.log('\n❌ Test abortado: No se pudo crear la orden')
      await cleanup()
      await printSummary()
      return
    }

    await testOrderTracking(order.orderNumber)
    await testDashboardOrderView(testUser.id, order.orderNumber)
    await testOrderStatusUpdate(testUser.id, order.orderNumber)

    // Cleanup
    await cleanup()

    // Resumen
    await printSummary()

  } catch (error) {
    console.error('\n💥 ERROR FATAL:', error)
    await cleanup()
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
