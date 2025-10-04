import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testCompleteSystem() {
  try {
    console.log('🧪 Iniciando tests completos del sistema...\n')

    // 1. Test de conexión a base de datos
    console.log('1️⃣ Probando conexión a base de datos...')
    await prisma.$connect()
    console.log('✅ Conexión exitosa\n')

    // 2. Test de usuarios y autenticación
    console.log('2️⃣ Probando sistema de usuarios...')
    const users = await prisma.user.findMany({
      include: {
        storeSettings: true
      }
    })
    console.log(`✅ Encontrados ${users.length} usuarios`)
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Rol: ${user.role}`)
    })
    console.log()

    // 3. Test de categorías
    console.log('3️⃣ Probando sistema de categorías...')
    const categories = await prisma.category.findMany({
      include: {
        categoryProducts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        _count: {
          select: {
            categoryProducts: true
          }
        }
      }
    })
    console.log(`✅ Encontradas ${categories.length} categorías`)
    categories.forEach(category => {
      console.log(`   - ${category.name} (${category.color}) - ${category._count.categoryProducts} productos`)
      category.categoryProducts.forEach(cp => {
        console.log(`     └─ ${cp.product.name} - $${cp.product.price}`)
      })
    })
    console.log()

    // 4. Test de productos
    console.log('4️⃣ Probando sistema de productos...')
    const products = await prisma.product.findMany({
      include: {
        categoryProducts: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        variants: true,
        images: true
      }
    })
    console.log(`✅ Encontrados ${products.length} productos`)
    products.forEach(product => {
      console.log(`   - ${product.name} - $${product.price}`)
      console.log(`     Categorías: ${product.categoryProducts.map(cp => cp.category.name).join(', ') || 'Sin categorías'}`)
      console.log(`     Variantes: ${product.variants.length}`)
      console.log(`     Imágenes: ${product.images.length}`)
    })
    console.log()

    // 5. Test de relaciones many-to-many
    console.log('5️⃣ Probando relaciones many-to-many...')
    const categoryProducts = await prisma.categoryProduct.findMany({
      include: {
        category: {
          select: {
            name: true,
            color: true
          }
        },
        product: {
          select: {
            name: true,
            price: true
          }
        }
      }
    })
    console.log(`✅ Encontradas ${categoryProducts.length} relaciones categoría-producto`)
    categoryProducts.forEach(cp => {
      console.log(`   - ${cp.category.name} ↔ ${cp.product.name} (Orden: ${cp.order})`)
    })
    console.log()

    // 6. Test de configuración de tienda
    console.log('6️⃣ Probando configuración de tienda...')
    const storeSettings = await prisma.storeSettings.findMany({
      include: {
        deliveryZones: true
      }
    })
    console.log(`✅ Encontradas ${storeSettings.length} configuraciones de tienda`)
    storeSettings.forEach(settings => {
      console.log(`   - ${settings.storeName} (${settings.storeSlug})`)
      console.log(`     País: ${settings.country} - Moneda: ${settings.currency}`)
      console.log(`     Horarios: ${settings.enableBusinessHours ? 'Activados' : 'Desactivados'}`)
      console.log(`     Zonas de entrega: ${settings.deliveryZones.length}`)
    })
    console.log()

    // 7. Test de zonas de entrega
    console.log('7️⃣ Probando zonas de entrega...')
    const deliveryZones = await prisma.deliveryZone.findMany({
      include: {
        storeSettings: {
          select: {
            storeName: true
          }
        }
      }
    })
    console.log(`✅ Encontradas ${deliveryZones.length} zonas de entrega`)
    deliveryZones.forEach(zone => {
      console.log(`   - ${zone.name} (${zone.type}) - ${zone.isActive ? 'Activa' : 'Inactiva'}`)
      console.log(`     Tienda: ${zone.storeSettings.storeName}`)
    })
    console.log()

    // 8. Test de invitaciones
    console.log('8️⃣ Probando sistema de invitaciones...')
    const invitations = await prisma.invitation.findMany()
    console.log(`✅ Encontradas ${invitations.length} invitaciones`)
    invitations.forEach(invitation => {
      console.log(`   - ${invitation.clientName} (${invitation.clientEmail})`)
      console.log(`     Estado: ${invitation.status} - Slug: ${invitation.slug}`)
    })
    console.log()

    // 9. Test de integridad de datos
    console.log('9️⃣ Verificando integridad de datos...')
    
    // Verificar que todos los productos tienen al menos una categoría
    const productsWithoutCategories = await prisma.product.findMany({
      where: {
        categoryProducts: {
          none: {}
        }
      }
    })
    
    if (productsWithoutCategories.length > 0) {
      console.log(`⚠️  ${productsWithoutCategories.length} productos sin categorías:`)
      productsWithoutCategories.forEach(p => console.log(`   - ${p.name}`))
    } else {
      console.log('✅ Todos los productos tienen categorías asignadas')
    }

    // Verificar que todas las categorías tienen al menos un producto
    const categoriesWithoutProducts = await prisma.category.findMany({
      where: {
        categoryProducts: {
          none: {}
        }
      }
    })
    
    if (categoriesWithoutProducts.length > 0) {
      console.log(`⚠️  ${categoriesWithoutProducts.length} categorías sin productos:`)
      categoriesWithoutProducts.forEach(c => console.log(`   - ${c.name}`))
    } else {
      console.log('✅ Todas las categorías tienen productos asignados')
    }

    console.log()

    // 10. Test de rendimiento
    console.log('🔟 Probando rendimiento de consultas...')
    const startTime = Date.now()
    
    // Consulta compleja con múltiples joins
    const complexQuery = await prisma.product.findMany({
      include: {
        categoryProducts: {
          include: {
            category: true
          }
        },
        variants: true,
        images: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    const endTime = Date.now()
    const queryTime = endTime - startTime
    
    console.log(`✅ Consulta compleja completada en ${queryTime}ms`)
    console.log(`   - ${complexQuery.length} productos con relaciones completas`)
    console.log()

    console.log('🎉 ¡Todos los tests completados exitosamente!')
    console.log('\n📊 RESUMEN:')
    console.log(`   - Usuarios: ${users.length}`)
    console.log(`   - Categorías: ${categories.length}`)
    console.log(`   - Productos: ${products.length}`)
    console.log(`   - Relaciones categoría-producto: ${categoryProducts.length}`)
    console.log(`   - Configuraciones de tienda: ${storeSettings.length}`)
    console.log(`   - Zonas de entrega: ${deliveryZones.length}`)
    console.log(`   - Invitaciones: ${invitations.length}`)
    console.log(`   - Tiempo de consulta compleja: ${queryTime}ms`)

  } catch (error) {
    console.error('❌ Error durante los tests:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testCompleteSystem()
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
