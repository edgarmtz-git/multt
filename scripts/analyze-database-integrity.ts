import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeDatabaseIntegrity() {
  try {
    console.log('🔍 Analizando integridad y relaciones de la base de datos...\n')
    
    // 1. Verificar usuarios y sus relaciones
    console.log('👥 USUARIOS Y RELACIONES:')
    const users = await prisma.user.findMany({
      include: {
        storeSettings: true,
        products: true,
        categories: true,
        orders: true
      }
    })
    
    console.log(`  - Total de usuarios: ${users.length}`)
    users.forEach(user => {
      console.log(`    👤 ${user.name || user.email} (${user.role})`)
      console.log(`      - Configuración de tienda: ${user.storeSettings ? '✅' : '❌'}`)
      console.log(`      - Productos: ${user.products.length}`)
      console.log(`      - Categorías: ${user.categories.length}`)
      console.log(`      - Pedidos: ${user.orders.length}`)
    })
    
    // 2. Verificar configuraciones de tienda
    console.log('\n🏪 CONFIGURACIONES DE TIENDA:')
    const storeSettings = await prisma.storeSettings.findMany({
      include: {
        user: true,
        deliveryZones: true
      }
    })
    
    console.log(`  - Total de configuraciones: ${storeSettings.length}`)
    storeSettings.forEach(store => {
      console.log(`    🏪 ${store.storeName} (${store.storeSlug})`)
      console.log(`      - Usuario: ${store.user.name || store.user.email}`)
      console.log(`      - Entregas habilitadas: ${store.deliveryEnabled ? '✅' : '❌'}`)
      console.log(`      - Horarios de entrega: ${store.deliveryScheduleEnabled ? '✅' : '❌'}`)
      console.log(`      - Zonas de entrega: ${store.deliveryZones.length}`)
      console.log(`      - Precio base: ${store.useBasePrice ? '✅' : '❌'}`)
      if (store.useBasePrice) {
        console.log(`        - Precio: $${store.baseDeliveryPrice || 0}`)
        console.log(`        - Umbral gratuito: $${store.baseDeliveryThreshold || 0}`)
      }
    })
    
    // 3. Verificar zonas de entrega
    console.log('\n🚚 ZONAS DE ENTREGA:')
    const deliveryZones = await prisma.deliveryZone.findMany({
      include: {
        storeSettings: {
          include: {
            user: true
          }
        }
      }
    })
    
    console.log(`  - Total de zonas: ${deliveryZones.length}`)
    deliveryZones.forEach(zone => {
      console.log(`    🚚 ${zone.name} (${zone.type})`)
      console.log(`      - Tienda: ${zone.storeSettings.storeName}`)
      console.log(`      - Activa: ${zone.isActive ? '✅' : '❌'}`)
      console.log(`      - Precio fijo: $${zone.fixedPrice || 0}`)
      console.log(`      - Tiempo estimado: ${zone.estimatedTime || 0} min`)
    })
    
    // 4. Verificar productos y categorías
    console.log('\n📦 PRODUCTOS Y CATEGORÍAS:')
    const products = await prisma.product.findMany({
      include: {
        user: true,
        categoryProducts: {
          include: {
            category: true
          }
        }
      }
    })
    
    console.log(`  - Total de productos: ${products.length}`)
    products.forEach(product => {
      console.log(`    📦 ${product.name} - $${product.price}`)
      console.log(`      - Usuario: ${product.user.name || product.user.email}`)
      console.log(`      - Activo: ${product.isActive ? '✅' : '❌'}`)
      console.log(`      - Categorías: ${product.categoryProducts.length}`)
      product.categoryProducts.forEach(cp => {
        console.log(`        - ${cp.category.name}`)
      })
    })
    
    // 5. Verificar pedidos
    console.log('\n🛒 PEDIDOS:')
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    })
    
    console.log(`  - Total de pedidos: ${orders.length}`)
    orders.forEach(order => {
      console.log(`    🛒 Pedido #${order.id.slice(-8)} - $${order.total}`)
      console.log(`      - Usuario: ${order.user.name || order.user.email}`)
      console.log(`      - Estado: ${order.status}`)
      console.log(`      - Items: ${order.items.length}`)
      order.items.forEach(item => {
        console.log(`        - ${item.product.name} x${item.quantity} - $${item.price}`)
        if (item.variant) {
          console.log(`          - Variante: ${item.variant.name}`)
        }
      })
    })
    
    // 6. Verificar integridad referencial
    console.log('\n🔗 INTEGRIDAD REFERENCIAL:')
    
    // Verificar que todos los storeSettings tienen un usuario válido
    const allSettings = await prisma.storeSettings.findMany({
      include: {
        user: true
      }
    })
    const orphanedSettings = allSettings.filter(s => !s.user)
    console.log(`  - Configuraciones huérfanas: ${orphanedSettings.length}`)
    
    // Verificar que todas las zonas tienen una configuración válida
    const allZones = await prisma.deliveryZone.findMany({
      include: {
        storeSettings: true
      }
    })
    const orphanedZones = allZones.filter(z => !z.storeSettings)
    console.log(`  - Zonas huérfanas: ${orphanedZones.length}`)
    
    // Verificar que todos los productos tienen un usuario válido
    const allProducts = await prisma.product.findMany({
      include: {
        user: true
      }
    })
    const orphanedProducts = allProducts.filter(p => !p.user)
    console.log(`  - Productos huérfanos: ${orphanedProducts.length}`)
    
    // 7. Resumen de integridad
    console.log('\n📊 RESUMEN DE INTEGRIDAD:')
    const totalIssues = orphanedSettings.length + orphanedZones.length + orphanedProducts.length
    
    if (totalIssues === 0) {
      console.log('  ✅ Todas las relaciones están intactas')
      console.log('  ✅ No hay registros huérfanos')
      console.log('  ✅ La integridad referencial es correcta')
    } else {
      console.log(`  ⚠️  Se encontraron ${totalIssues} problemas de integridad`)
      if (orphanedSettings.length > 0) {
        console.log(`    - ${orphanedSettings.length} configuraciones sin usuario`)
      }
      if (orphanedZones.length > 0) {
        console.log(`    - ${orphanedZones.length} zonas sin configuración`)
      }
      if (orphanedProducts.length > 0) {
        console.log(`    - ${orphanedProducts.length} productos sin usuario`)
      }
    }
    
    console.log('\n🎉 Análisis de integridad completado')
    
  } catch (error) {
    console.error('❌ Error analizando integridad:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeDatabaseIntegrity()
