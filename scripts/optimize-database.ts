#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { prisma } from '../lib/prisma'

/**
 * Script para optimizar la base de datos
 * Analiza y optimiza consultas, índices y rendimiento
 */

interface QueryStats {
  query: string
  calls: number
  totalTime: number
  avgTime: number
  slowQueries: number
}

interface IndexStats {
  table: string
  index: string
  size: string
  usage: number
  efficiency: number
}

/**
 * Analiza el rendimiento de la base de datos
 */
async function analyzeDatabasePerformance() {
  console.log('🔍 Analizando rendimiento de la base de datos...')
  
  try {
    // Obtener estadísticas de consultas (PostgreSQL)
    const queryStats = await prisma.$queryRaw`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      ORDER BY total_time DESC 
      LIMIT 10
    ` as any[]

    console.log('\n📊 Top 10 consultas más lentas:')
    queryStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.query.substring(0, 100)}...`)
      console.log(`      Llamadas: ${stat.calls}, Tiempo total: ${stat.total_time}ms, Promedio: ${stat.mean_time}ms`)
    })

    // Obtener estadísticas de índices
    const indexStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      ORDER BY idx_scan DESC
    ` as any[]

    console.log('\n📈 Estadísticas de índices:')
    indexStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.tablename}.${stat.indexname}`)
      console.log(`      Escaneos: ${stat.idx_scan}, Lecturas: ${stat.idx_tup_read}`)
    })

    return { queryStats, indexStats }
  } catch (error) {
    console.error('❌ Error analizando rendimiento:', error)
    return null
  }
}

/**
 * Optimiza consultas específicas
 */
async function optimizeQueries() {
  console.log('\n⚡ Optimizando consultas...')
  
  try {
    // Analizar tablas
    await prisma.$executeRaw`ANALYZE`
    console.log('   ✅ Análisis de tablas completado')

    // Vacuum para limpiar espacio
    await prisma.$executeRaw`VACUUM ANALYZE`
    console.log('   ✅ Vacuum completado')

    // Reindexar tablas críticas
    const criticalTables = ['products', 'orders', 'categories', 'users']
    
    for (const table of criticalTables) {
      try {
        await prisma.$executeRaw`REINDEX TABLE ${table}`
        console.log(`   ✅ Tabla ${table} reindexada`)
      } catch (error) {
        console.log(`   ⚠️  No se pudo reindexar ${table}: ${error}`)
      }
    }

    return true
  } catch (error) {
    console.error('❌ Error optimizando consultas:', error)
    return false
  }
}

/**
 * Crea índices adicionales para optimización
 */
async function createOptimizationIndexes() {
  console.log('\n📊 Creando índices de optimización...')
  
  try {
    const indexes = [
      // Índices para productos
      `CREATE INDEX IF NOT EXISTS "Product_name_idx" ON "products" ("name");`,
      `CREATE INDEX IF NOT EXISTS "Product_price_idx" ON "products" ("price");`,
      `CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "products" ("createdAt" DESC);`,
      
      // Índices para órdenes
      `CREATE INDEX IF NOT EXISTS "Order_orderNumber_idx" ON "orders" ("orderNumber");`,
      `CREATE INDEX IF NOT EXISTS "Order_customerName_idx" ON "orders" ("customerName");`,
      `CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "orders" ("status", "createdAt" DESC);`,
      
      // Índices para categorías
      `CREATE INDEX IF NOT EXISTS "Category_name_idx" ON "categories" ("name");`,
      `CREATE INDEX IF NOT EXISTS "Category_order_idx" ON "categories" ("order");`,
      
      // Índices para usuarios
      `CREATE INDEX IF NOT EXISTS "User_email_idx" ON "users" ("email");`,
      `CREATE INDEX IF NOT EXISTS "User_name_idx" ON "users" ("name");`,
      
      // Índices para configuraciones de tienda
      `CREATE INDEX IF NOT EXISTS "StoreSettings_storeSlug_idx" ON "store_settings" ("storeSlug");`,
      `CREATE INDEX IF NOT EXISTS "StoreSettings_storeActive_idx" ON "store_settings" ("storeActive");`,
      
      // Índices para items de orden
      `CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "order_items" ("orderId");`,
      `CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "order_items" ("productId");`,
      
      // Índices para variantes de producto
      `CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "product_variants" ("productId");`,
      `CREATE INDEX IF NOT EXISTS "ProductVariant_isActive_idx" ON "product_variants" ("isActive");`,
      
      // Índices para opciones de producto
      `CREATE INDEX IF NOT EXISTS "ProductOption_productId_idx" ON "product_options" ("productId");`,
      `CREATE INDEX IF NOT EXISTS "ProductOption_isActive_idx" ON "product_options" ("isActive");`,
      
      // Índices para logs de auditoría
      `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "audit_logs" ("action");`,
      `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "audit_logs" ("createdAt" DESC);`,
    ]

    for (const indexQuery of indexes) {
      try {
        await prisma.$executeRaw`${indexQuery}`
        console.log(`   ✅ Índice creado: ${indexQuery.split('"')[1]}`)
      } catch (error) {
        console.log(`   ⚠️  No se pudo crear índice: ${error}`)
      }
    }

    return true
  } catch (error) {
    console.error('❌ Error creando índices:', error)
    return false
  }
}

/**
 * Limpia datos obsoletos
 */
async function cleanupObsoleteData() {
  console.log('\n🧹 Limpiando datos obsoletos...')
  
  try {
    // Limpiar logs de auditoría antiguos (más de 1 año)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const deletedAuditLogs = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: oneYearAgo
        }
      }
    })
    
    console.log(`   ✅ ${deletedAuditLogs.count} logs de auditoría eliminados`)

    // Limpiar sesiones expiradas
    const expiredSessions = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    
    console.log(`   ✅ ${expiredSessions.count} sesiones expiradas eliminadas`)

    // Limpiar productos inactivos antiguos (más de 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const deletedProducts = await prisma.product.deleteMany({
      where: {
        isActive: false,
        updatedAt: {
          lt: sixMonthsAgo
        }
      }
    })
    
    console.log(`   ✅ ${deletedProducts.count} productos inactivos eliminados`)

    return true
  } catch (error) {
    console.error('❌ Error limpiando datos:', error)
    return false
  }
}

/**
 * Genera reporte de optimización
 */
async function generateOptimizationReport() {
  console.log('\n📋 Generando reporte de optimización...')
  
  try {
    // Estadísticas de tablas
    const tableStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC
    ` as any[]

    console.log('\n📊 Estadísticas de tablas:')
    tableStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.tablename}`)
      console.log(`      Inserciones: ${stat.inserts}, Actualizaciones: ${stat.updates}, Eliminaciones: ${stat.deletes}`)
      console.log(`      Tuplas vivas: ${stat.live_tuples}, Tuplas muertas: ${stat.dead_tuples}`)
    })

    // Tamaño de la base de datos
    const dbSize = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    ` as any[]

    console.log(`\n💾 Tamaño de la base de datos: ${dbSize[0]?.size}`)

    return { tableStats, dbSize }
  } catch (error) {
    console.error('❌ Error generando reporte:', error)
    return null
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando optimización de base de datos...')
  
  try {
    // 1. Analizar rendimiento
    await analyzeDatabasePerformance()
    
    // 2. Optimizar consultas
    await optimizeQueries()
    
    // 3. Crear índices adicionales
    await createOptimizationIndexes()
    
    // 4. Limpiar datos obsoletos
    await cleanupObsoleteData()
    
    // 5. Generar reporte
    await generateOptimizationReport()
    
    console.log('\n🎉 ¡Optimización completada exitosamente!')
    console.log('\n💡 Recomendaciones:')
    console.log('   • Ejecuta este script regularmente para mantener el rendimiento')
    console.log('   • Monitorea el rendimiento de consultas lentas')
    console.log('   • Considera implementar particionado para tablas grandes')
    console.log('   • Revisa los índices no utilizados periódicamente')
    
  } catch (error) {
    console.error('❌ Error en la optimización:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

export { 
  analyzeDatabasePerformance, 
  optimizeQueries, 
  createOptimizationIndexes, 
  cleanupObsoleteData,
  generateOptimizationReport 
}
