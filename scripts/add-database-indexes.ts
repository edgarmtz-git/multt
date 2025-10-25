#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addDatabaseIndexes() {
  console.log('🔍 Agregando índices compuestos para optimizar queries...\n')

  try {
    // Índices para Product
    console.log('📦 Agregando índices para Product...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_products_user_active" 
      ON "products" ("userId", "isActive")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_products_user_created" 
      ON "products" ("userId", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_products_active_created" 
      ON "products" ("isActive", "createdAt" DESC)
    `
    console.log('✅ Índices de Product agregados')

    // Índices para Order
    console.log('📋 Agregando índices para Order...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_orders_user_status" 
      ON "orders" ("userId", "status")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_orders_user_created" 
      ON "orders" ("userId", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_orders_status_created" 
      ON "orders" ("status", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_orders_customer_whatsapp" 
      ON "orders" ("customerWhatsApp")
    `
    console.log('✅ Índices de Order agregados')

    // Índices para Category
    console.log('📁 Agregando índices para Category...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_categories_user_active" 
      ON "categories" ("userId", "isActive")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_categories_user_order" 
      ON "categories" ("userId", "order")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_categories_active_order" 
      ON "categories" ("isActive", "order")
    `
    console.log('✅ Índices de Category agregados')

    // Índices para AuditLog
    console.log('📊 Agregando índices para AuditLog...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_created" 
      ON "audit_logs" ("userId", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_action_created" 
      ON "audit_logs" ("action", "createdAt" DESC)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_resource_created" 
      ON "audit_logs" ("resource", "createdAt" DESC)
    `
    console.log('✅ Índices de AuditLog agregados')

    // Índices para OrderItem
    console.log('🛒 Agregando índices para OrderItem...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_order_items_order_created" 
      ON "order_items" ("orderId", "createdAt")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_order_items_product" 
      ON "order_items" ("productId")
    `
    console.log('✅ Índices de OrderItem agregados')

    // Índices para ProductVariant
    console.log('🔧 Agregando índices para ProductVariant...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_product_variants_product_active" 
      ON "product_variants" ("productId", "isActive")
    `
    console.log('✅ Índices de ProductVariant agregados')

    // Índices para CategoryProduct
    console.log('🔗 Agregando índices para CategoryProduct...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_category_products_category" 
      ON "category_products" ("categoryId")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_category_products_product" 
      ON "category_products" ("productId")
    `
    console.log('✅ Índices de CategoryProduct agregados')

    // Índices para User
    console.log('👤 Agregando índices para User...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_users_role_active" 
      ON "users" ("role", "isActive")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_users_email" 
      ON "users" ("email")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_users_created" 
      ON "users" ("createdAt" DESC)
    `
    console.log('✅ Índices de User agregados')

    // Índices para StoreSettings
    console.log('🏪 Agregando índices para StoreSettings...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_store_settings_slug" 
      ON "store_settings" ("storeSlug")
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_store_settings_active" 
      ON "store_settings" ("storeActive")
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
