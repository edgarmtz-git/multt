import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditDatabaseSchema() {
  try {
    console.log('🔍 AUDITORÍA COMPLETA DEL ESQUEMA DE BASE DE DATOS\n')
    
    // 1. Verificar todas las tablas y sus campos
    console.log('1️⃣ VERIFICANDO ESTRUCTURA DE TABLAS...\n')
    
    // Users
    console.log('👤 TABLA: users')
    const users = await prisma.user.findMany({ take: 1 })
    console.log(`  ✅ Campos disponibles: ${Object.keys(users[0] || {}).length}`)
    console.log(`  📊 Registros: ${await prisma.user.count()}`)
    
    // Categories
    console.log('\n📁 TABLA: categories')
    const categories = await prisma.category.findMany({ take: 1 })
    console.log(`  ✅ Campos disponibles: ${Object.keys(categories[0] || {}).length}`)
    console.log(`  📊 Registros: ${await prisma.category.count()}`)
    
    // Products
    console.log('\n🛍️ TABLA: products')
    const products = await prisma.product.findMany({ take: 1 })
    console.log(`  ✅ Campos disponibles: ${Object.keys(products[0] || {}).length}`)
    console.log(`  📊 Registros: ${await prisma.product.count()}`)
    
    // StoreSettings
    console.log('\n⚙️ TABLA: store_settings')
    const storeSettings = await prisma.storeSettings.findMany({ take: 1 })
    console.log(`  ✅ Campos disponibles: ${Object.keys(storeSettings[0] || {}).length}`)
    console.log(`  📊 Registros: ${await prisma.storeSettings.count()}`)
    
    // DeliveryZones
    console.log('\n🚚 TABLA: delivery_zones')
    const deliveryZones = await prisma.deliveryZone.findMany({ take: 1 })
    console.log(`  ✅ Campos disponibles: ${Object.keys(deliveryZones[0] || {}).length}`)
    console.log(`  📊 Registros: ${await prisma.deliveryZone.count()}`)
    
    // Orders
    console.log('\n📦 TABLA: orders')
    const orders = await prisma.order.findMany({ take: 1 })
    console.log(`  ✅ Campos disponibles: ${Object.keys(orders[0] || {}).length}`)
    console.log(`  📊 Registros: ${await prisma.order.count()}`)
    
    // OrderItems
    console.log('\n📋 TABLA: order_items')
    const orderItems = await prisma.orderItem.findMany({ take: 1 })
    console.log(`  ✅ Campos disponibles: ${Object.keys(orderItems[0] || {}).length}`)
    console.log(`  📊 Registros: ${await prisma.orderItem.count()}`)
    
    // Invitations
    console.log('\n📧 TABLA: invitations')
    const invitations = await prisma.invitation.findMany({ take: 1 })
    console.log(`  ✅ Campos disponibles: ${Object.keys(invitations[0] || {}).length}`)
    console.log(`  📊 Registros: ${await prisma.invitation.count()}`)
    
    // 2. Verificar campos específicos de StoreSettings
    console.log('\n2️⃣ VERIFICANDO CAMPOS ESPECÍFICOS DE STORE_SETTINGS...\n')
    
    const settings = await prisma.storeSettings.findFirst()
    if (settings) {
      console.log('📋 CAMPOS DE CONFIGURACIÓN:')
      console.log(`  - storeName: ${settings.storeName}`)
      console.log(`  - storeSlug: ${settings.storeSlug}`)
      console.log(`  - email: ${settings.email || 'No configurado'}`)
      console.log(`  - address: ${settings.address || 'No configurado'}`)
      console.log(`  - whatsappMainNumber: ${settings.whatsappMainNumber || 'No configurado'}`)
      console.log(`  - country: ${settings.country}`)
      console.log(`  - language: ${settings.language}`)
      console.log(`  - currency: ${settings.currency}`)
      console.log(`  - mapProvider: ${settings.mapProvider}`)
      console.log(`  - taxRate: ${settings.taxRate}`)
      console.log(`  - taxMethod: ${settings.taxMethod}`)
      console.log(`  - enableBusinessHours: ${settings.enableBusinessHours}`)
      console.log(`  - disableCheckoutOutsideHours: ${settings.disableCheckoutOutsideHours}`)
      console.log(`  - businessHours: ${settings.businessHours ? 'Configurado' : 'No configurado'}`)
      console.log(`  - deliveryEnabled: ${settings.deliveryEnabled}`)
      console.log(`  - useBasePrice: ${settings.useBasePrice}`)
      console.log(`  - baseDeliveryPrice: ${settings.baseDeliveryPrice || 'No configurado'}`)
      console.log(`  - baseDeliveryThreshold: ${settings.baseDeliveryThreshold || 'No configurado'}`)
      console.log(`  - unifiedSchedule: ${settings.unifiedSchedule ? 'Configurado' : 'No configurado'}`)
      console.log(`  - deliveryScheduleEnabled: ${settings.deliveryScheduleEnabled}`)
      console.log(`  - scheduleType: ${settings.scheduleType || 'No configurado'}`)
      console.log(`  - advanceDays: ${settings.advanceDays || 'No configurado'}`)
      console.log(`  - serviceHours: ${settings.serviceHours ? 'Configurado' : 'No configurado'}`)
      console.log(`  - paymentsEnabled: ${settings.paymentsEnabled}`)
      console.log(`  - storeActive: ${settings.storeActive}`)
      console.log(`  - passwordProtected: ${settings.passwordProtected}`)
      console.log(`  - accessPassword: ${settings.accessPassword ? 'Configurado' : 'No configurado'}`)
    }
    
    // 3. Verificar relaciones
    console.log('\n3️⃣ VERIFICANDO RELACIONES...\n')
    
    // User -> StoreSettings
    const userWithSettings = await prisma.user.findFirst({
      include: { storeSettings: true }
    })
    console.log(`👤 User -> StoreSettings: ${userWithSettings?.storeSettings ? '✅ Relación OK' : '❌ Sin configuración'}`)
    
    // StoreSettings -> DeliveryZones
    const settingsWithZones = await prisma.storeSettings.findFirst({
      include: { deliveryZones: true }
    })
    console.log(`⚙️ StoreSettings -> DeliveryZones: ${settingsWithZones?.deliveryZones.length || 0} zonas`)
    
    // User -> Products
    const userWithProducts = await prisma.user.findFirst({
      include: { products: true }
    })
    console.log(`👤 User -> Products: ${userWithProducts?.products.length || 0} productos`)
    
    // User -> Categories
    const userWithCategories = await prisma.user.findFirst({
      include: { categories: true }
    })
    console.log(`👤 User -> Categories: ${userWithCategories?.categories.length || 0} categorías`)
    
    // User -> Orders
    const userWithOrders = await prisma.user.findFirst({
      include: { orders: true }
    })
    console.log(`👤 User -> Orders: ${userWithOrders?.orders.length || 0} pedidos`)
    
    // 4. Verificar integridad de datos
    console.log('\n4️⃣ VERIFICANDO INTEGRIDAD DE DATOS...\n')
    
    // Verificar usuarios sin configuración
    const usersWithoutSettings = await prisma.user.findMany({
      where: { storeSettings: null }
    })
    console.log(`👤 Usuarios sin configuración: ${usersWithoutSettings.length}`)
    
    // Verificar configuraciones huérfanas
    const orphanedSettings = await prisma.storeSettings.findMany({
      where: { user: null }
    })
    console.log(`⚙️ Configuraciones huérfanas: ${orphanedSettings.length}`)
    
    // Verificar productos sin usuario
    const productsWithoutUser = await prisma.product.findMany({
      where: { user: null }
    })
    console.log(`🛍️ Productos sin usuario: ${productsWithoutUser.length}`)
    
    // Verificar categorías sin usuario
    const categoriesWithoutUser = await prisma.category.findMany({
      where: { user: null }
    })
    console.log(`📁 Categorías sin usuario: ${categoriesWithoutUser.length}`)
    
    // 5. Verificar campos JSON
    console.log('\n5️⃣ VERIFICANDO CAMPOS JSON...\n')
    
    if (settings) {
      // unifiedSchedule
      if (settings.unifiedSchedule) {
        try {
          const unifiedSchedule = JSON.parse(settings.unifiedSchedule as string)
          console.log(`📅 unifiedSchedule: ${Object.keys(unifiedSchedule).join(', ')}`)
        } catch (error) {
          console.log(`❌ unifiedSchedule: Error al parsear JSON`)
        }
      } else {
        console.log(`📅 unifiedSchedule: No configurado`)
      }
      
      // businessHours
      if (settings.businessHours) {
        try {
          const businessHours = JSON.parse(settings.businessHours as string)
          console.log(`🕒 businessHours: ${Object.keys(businessHours).join(', ')}`)
        } catch (error) {
          console.log(`❌ businessHours: Error al parsear JSON`)
        }
      } else {
        console.log(`🕒 businessHours: No configurado`)
      }
      
      // serviceHours
      if (settings.serviceHours) {
        try {
          const serviceHours = JSON.parse(settings.serviceHours as string)
          console.log(`⏰ serviceHours: ${Object.keys(serviceHours).join(', ')}`)
        } catch (error) {
          console.log(`❌ serviceHours: Error al parsear JSON`)
        }
      } else {
        console.log(`⏰ serviceHours: No configurado`)
      }
      
      // address
      if (settings.address) {
        try {
          const address = JSON.parse(settings.address as string)
          console.log(`📍 address: ${Object.keys(address).join(', ')}`)
        } catch (error) {
          console.log(`❌ address: Error al parsear JSON`)
        }
      } else {
        console.log(`📍 address: No configurado`)
      }
      
      // whatsappSequentialNumbers
      if (settings.whatsappSequentialNumbers) {
        try {
          const numbers = JSON.parse(settings.whatsappSequentialNumbers)
          console.log(`📱 whatsappSequentialNumbers: ${numbers.length} números`)
        } catch (error) {
          console.log(`❌ whatsappSequentialNumbers: Error al parsear JSON`)
        }
      } else {
        console.log(`📱 whatsappSequentialNumbers: No configurado`)
      }
    }
    
    // 6. Resumen final
    console.log('\n6️⃣ RESUMEN FINAL...\n')
    
    const totalUsers = await prisma.user.count()
    const totalSettings = await prisma.storeSettings.count()
    const totalProducts = await prisma.product.count()
    const totalCategories = await prisma.category.count()
    const totalOrders = await prisma.order.count()
    const totalDeliveryZones = await prisma.deliveryZone.count()
    const totalInvitations = await prisma.invitation.count()
    
    console.log('📊 ESTADÍSTICAS GENERALES:')
    console.log(`  👤 Usuarios: ${totalUsers}`)
    console.log(`  ⚙️ Configuraciones: ${totalSettings}`)
    console.log(`  🛍️ Productos: ${totalProducts}`)
    console.log(`  📁 Categorías: ${totalCategories}`)
    console.log(`  📦 Pedidos: ${totalOrders}`)
    console.log(`  🚚 Zonas de entrega: ${totalDeliveryZones}`)
    console.log(`  📧 Invitaciones: ${totalInvitations}`)
    
    console.log('\n✅ AUDITORÍA COMPLETADA')
    console.log('\n🎯 RECOMENDACIONES:')
    console.log('  1. Verificar que todos los usuarios tengan configuración')
    console.log('  2. Revisar campos JSON para asegurar formato correcto')
    console.log('  3. Validar relaciones entre tablas')
    console.log('  4. Verificar integridad de datos')
    
  } catch (error) {
    console.error('❌ Error en auditoría:', error)
  } finally {
    await prisma.$disconnect()
  }
}

auditDatabaseSchema()
