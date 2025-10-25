#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addDatabaseIndexes() {
  console.log('🔍 Agregando índices compuestos para optimizar queries...\n')

  try {
    // Verificar el tipo de base de datos
    const dbInfo = await prisma.$queryRaw`SELECT sqlite_version() as version` as any[]
    const isSQLite = dbInfo.length > 0
    
    console.log(`📊 Tipo de base de datos detectado: ${isSQLite ? 'SQLite' : 'PostgreSQL'}`)

    if (isSQLite) {
      console.log('📦 Agregando índices para SQLite...')
      
      // Índices para Product (SQLite)
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

      // Índices para Order (SQLite)
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

      // Índices para Category (SQLite)
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

      // Índices para User (SQLite)
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

    } else {
      console.log('📦 Agregando índices para PostgreSQL...')
      
      // Índices para Product (PostgreSQL)
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

      // Índices para Order (PostgreSQL)
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

      // Índices para Category (PostgreSQL)
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

      // Índices para User (PostgreSQL)
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
    }

    console.log('\n🎉 ¡Todos los índices han sido agregados exitosamente!')
    console.log('\n📈 Beneficios esperados:')
    console.log('✅ Queries más rápidas en productos por usuario')
    console.log('✅ Queries más rápidas en órdenes por estado')
    console.log('✅ Queries más rápidas en categorías ordenadas')
    console.log('✅ Queries más rápidas en búsquedas por email')

  } catch (error) {
    console.error('❌ Error agregando índices:', error)
    console.log('\n💡 Sugerencias:')
    console.log('1. Verifica que DATABASE_URL esté configurada correctamente')
    console.log('2. Asegúrate de que la base de datos esté accesible')
    console.log('3. Verifica que el schema de Prisma esté sincronizado')
  } finally {
    await prisma.$disconnect()
  }
}

addDatabaseIndexes()

