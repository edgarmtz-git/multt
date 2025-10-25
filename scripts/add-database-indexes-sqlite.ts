#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addDatabaseIndexes() {
  console.log('🔍 Agregando índices compuestos para optimizar queries (SQLite)...\n')

  try {
    // Índices para Product
    console.log('📦 Agregando índices para Product...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_products_user_active" 
      ON "Product" ("userId", "isActive")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_products_user_created" 
      ON "Product" ("userId", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_products_active_created" 
      ON "Product" ("isActive", "createdAt" DESC)
    `
    console.log('✅ Índices de Product agregados')

    // Índices para Order
    console.log('📋 Agregando índices para Order...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_orders_user_status" 
      ON "Order" ("userId", "status")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_orders_user_created" 
      ON "Order" ("userId", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_orders_status_created" 
      ON "Order" ("status", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_orders_customer_whatsapp" 
      ON "Order" ("customerWhatsApp")
    `
    console.log('✅ Índices de Order agregados')

    // Índices para Category
    console.log('📁 Agregando índices para Category...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_categories_user_active" 
      ON "Category" ("userId", "isActive")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_categories_user_order" 
      ON "Category" ("userId", "order")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_categories_active_order" 
      ON "Category" ("isActive", "order")
    `
    console.log('✅ Índices de Category agregados')

    // Índices para AuditLog
    console.log('📊 Agregando índices para AuditLog...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_created" 
      ON "AuditLog" ("userId", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_action_created" 
      ON "AuditLog" ("action", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_resource_created" 
      ON "AuditLog" ("resource", "createdAt" DESC)
    `
    console.log('✅ Índices de AuditLog agregados')

    // Índices para OrderItem
    console.log('🛒 Agregando índices para OrderItem...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_order_items_order_created" 
      ON "OrderItem" ("orderId", "createdAt")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_order_items_product" 
      ON "OrderItem" ("productId")
    `
    console.log('✅ Índices de OrderItem agregados')

    // Índices para ProductVariant
    console.log('🔧 Agregando índices para ProductVariant...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_product_variants_product_active" 
      ON "ProductVariant" ("productId", "isActive")
    `
    console.log('✅ Índices de ProductVariant agregados')

    // Índices para CategoryProduct
    console.log('🔗 Agregando índices para CategoryProduct...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_category_products_category" 
      ON "CategoryProduct" ("categoryId")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_category_products_product" 
      ON "CategoryProduct" ("productId")
    `
    console.log('✅ Índices de CategoryProduct agregados')

    // Índices para User
    console.log('👤 Agregando índices para User...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_users_role_active" 
      ON "User" ("role", "isActive")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_users_email" 
      ON "User" ("email")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_users_created" 
      ON "User" ("createdAt" DESC)
    `
    console.log('✅ Índices de User agregados')

    // Índices para StoreSettings
    console.log('🏪 Agregando índices para StoreSettings...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_store_settings_slug" 
      ON "StoreSettings" ("storeSlug")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_store_settings_active" 
      ON "StoreSettings" ("storeActive")
    `
    console.log('✅ Índices de StoreSettings agregados')

    console.log('\n🎉 ¡Todos los índices han sido agregados exitosamente!')
    console.log('\n📈 Beneficios esperados:')
    console.log('✅ Queries más rápidas en productos por usuario')
    console.log('✅ Queries más rápidas en órdenes por estado')
    console.log('✅ Queries más rápidas en categorías ordenadas')
    console.log('✅ Queries más rápidas en logs de auditoría')
    console.log('✅ Queries más rápidas en búsquedas por email')
    console.log('✅ Queries más rápidas en tiendas por slug')

  } catch (error) {
    console.error('❌ Error agregando índices:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addDatabaseIndexes()

