#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { prisma } from '../lib/prisma'

/**
 * Script para migrar precios de Float a Decimal
 * Mejora la precisión financiera del sistema
 */

interface PriceMigrationStats {
  products: number
  variants: number
  orderItems: number
  orderItemOptions: number
  deliveryZones: number
  categories: number
  totalRecords: number
}

async function migratePricesToDecimal(): Promise<PriceMigrationStats> {
  console.log('💰 Iniciando migración de precios Float a Decimal...')
  
  const stats: PriceMigrationStats = {
    products: 0,
    variants: 0,
    orderItems: 0,
    orderItemOptions: 0,
    deliveryZones: 0,
    categories: 0,
    totalRecords: 0
  }

  try {
    // 1. Migrar precios de productos
    console.log('\n📦 Migrando precios de productos...')
    const products = await prisma.product.findMany({
      select: { id: true, price: true }
    })
    
    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: { 
          price: parseFloat(product.price.toFixed(2))
        }
      })
      stats.products++
    }
    console.log(`   ✅ ${stats.products} productos migrados`)

    // 2. Migrar precios de variantes
    console.log('\n🔄 Migrando precios de variantes...')
    const variants = await prisma.productVariant.findMany({
      select: { id: true, price: true }
    })
    
    for (const variant of variants) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { 
          price: parseFloat(variant.price.toFixed(2))
        }
      })
      stats.variants++
    }
    console.log(`   ✅ ${stats.variants} variantes migradas`)

    // 3. Migrar precios de items de orden
    console.log('\n🛒 Migrando precios de items de orden...')
    const orderItems = await prisma.orderItem.findMany({
      select: { id: true, price: true }
    })
    
    for (const item of orderItems) {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { 
          price: parseFloat(item.price.toFixed(2))
        }
      })
      stats.orderItems++
    }
    console.log(`   ✅ ${stats.orderItems} items de orden migrados`)

    // 4. Migrar precios de opciones de items
    console.log('\n⚙️ Migrando precios de opciones de items...')
    const orderItemOptions = await prisma.orderItemOption.findMany({
      select: { id: true, price: true }
    })
    
    for (const option of orderItemOptions) {
      await prisma.orderItemOption.update({
        where: { id: option.id },
        data: { 
          price: parseFloat(option.price.toFixed(2))
        }
      })
      stats.orderItemOptions++
    }
    console.log(`   ✅ ${stats.orderItemOptions} opciones de items migradas`)

    // 5. Migrar precios de zonas de entrega
    console.log('\n🚚 Migrando precios de zonas de entrega...')
    const deliveryZones = await prisma.deliveryZone.findMany({
      select: { id: true, price: true }
    })
    
    for (const zone of deliveryZones) {
      await prisma.deliveryZone.update({
        where: { id: zone.id },
        data: { 
          price: parseFloat(zone.price.toFixed(2))
        }
      })
      stats.deliveryZones++
    }
    console.log(`   ✅ ${stats.deliveryZones} zonas de entrega migradas`)

    // 6. Migrar precios de categorías
    console.log('\n🏷️ Migrando precios de categorías...')
    const categories = await prisma.category.findMany({
      select: { id: true, price: true }
    })
    
    for (const category of categories) {
      await prisma.category.update({
        where: { id: category.id },
        data: { 
          price: parseFloat(category.price.toFixed(2))
        }
      })
      stats.categories++
    }
    console.log(`   ✅ ${stats.categories} categorías migradas`)

    // Calcular total
    stats.totalRecords = stats.products + stats.variants + stats.orderItems + 
                        stats.orderItemOptions + stats.deliveryZones + stats.categories

    console.log('\n🎉 Migración completada exitosamente!')
    console.log('\n📊 Estadísticas de migración:')
    console.log(`   📦 Productos: ${stats.products}`)
    console.log(`   🔄 Variantes: ${stats.variants}`)
    console.log(`   🛒 Items de orden: ${stats.orderItems}`)
    console.log(`   ⚙️ Opciones de items: ${stats.orderItemOptions}`)
    console.log(`   🚚 Zonas de entrega: ${stats.deliveryZones}`)
    console.log(`   🏷️ Categorías: ${stats.categories}`)
    console.log(`   📈 Total de registros: ${stats.totalRecords}`)

    return stats

  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    throw error
  }
}

async function validatePricePrecision(): Promise<void> {
  console.log('\n🔍 Validando precisión de precios...')
  
  try {
    // Verificar que no hay precios con más de 2 decimales
    const problematicProducts = await prisma.product.findMany({
      where: {
        price: {
          not: {
            equals: prisma.product.fields.price
          }
        }
      },
      select: { id: true, name: true, price: true }
    })

    if (problematicProducts.length > 0) {
      console.log('⚠️ Productos con problemas de precisión:')
      problematicProducts.forEach(product => {
        console.log(`   - ${product.name}: ${product.price}`)
      })
    } else {
      console.log('✅ Todos los precios tienen precisión correcta')
    }

    // Verificar cálculos de totales
    const orders = await prisma.order.findMany({
      select: { 
        id: true, 
        total: true, 
        subtotal: true, 
        deliveryFee: true,
        items: {
          select: {
            price: true,
            quantity: true
          }
        }
      },
      take: 5
    })

    console.log('\n🧮 Validando cálculos de totales:')
    orders.forEach(order => {
      const calculatedSubtotal = order.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      )
      const calculatedTotal = calculatedSubtotal + (order.deliveryFee || 0)
      
      console.log(`   Orden ${order.id}:`)
      console.log(`     Subtotal calculado: ${calculatedSubtotal.toFixed(2)}`)
      console.log(`     Subtotal almacenado: ${order.subtotal}`)
      console.log(`     Total calculado: ${calculatedTotal.toFixed(2)}`)
      console.log(`     Total almacenado: ${order.total}`)
    })

  } catch (error) {
    console.error('❌ Error validando precisión:', error)
    throw error
  }
}

async function createBackup(): Promise<void> {
  console.log('\n💾 Creando backup de precios...')
  
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      products: await prisma.product.findMany({
        select: { id: true, name: true, price: true }
      }),
      variants: await prisma.productVariant.findMany({
        select: { id: true, name: true, price: true }
      }),
      orderItems: await prisma.orderItem.findMany({
        select: { id: true, price: true }
      })
    }

    const fs = await import('fs/promises')
    const backupPath = `./prisma/price-backup-${Date.now()}.json`
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2))
    
    console.log(`   ✅ Backup creado: ${backupPath}`)
  } catch (error) {
    console.error('❌ Error creando backup:', error)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando migración de precios Float a Decimal')
  
  try {
    // 1. Crear backup
    await createBackup()
    
    // 2. Migrar precios
    const stats = await migratePricesToDecimal()
    
    // 3. Validar precisión
    await validatePricePrecision()
    
    console.log('\n🎯 Recomendaciones post-migración:')
    console.log('   1. Actualizar el schema.prisma para usar Decimal en lugar de Float')
    console.log('   2. Ejecutar prisma generate para actualizar el cliente')
    console.log('   3. Verificar que todos los cálculos funcionen correctamente')
    console.log('   4. Probar operaciones de pago y facturación')
    
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

export { migratePricesToDecimal, validatePricePrecision, createBackup }
