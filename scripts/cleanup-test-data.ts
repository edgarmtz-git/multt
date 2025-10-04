import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupTestData() {
  try {
    console.log('🧹 Limpiando datos de prueba de la base de datos...\n')
    
    // 1. Identificar usuarios a eliminar (mantener admin y el usuario de Nanixhe Chicken)
    console.log('👥 Identificando usuarios a eliminar...')
    const usersToDelete = await prisma.user.findMany({
      where: {
        AND: [
          { role: 'CLIENT' },
          { 
            storeSettings: {
              storeName: {
                not: 'Nanixhe Chicken'
              }
            }
          }
        ]
      },
      include: {
        storeSettings: true
      }
    })
    
    console.log(`  - Usuarios a eliminar: ${usersToDelete.length}`)
    usersToDelete.forEach(user => {
      console.log(`    👤 ${user.name || user.email} - ${user.storeSettings?.storeName}`)
    })
    
    // 2. Eliminar zonas de entrega de tiendas de prueba
    console.log('\n🚚 Eliminando zonas de entrega de tiendas de prueba...')
    const zonesToDelete = await prisma.deliveryZone.findMany({
      where: {
        storeSettings: {
          storeName: {
            not: 'Nanixhe Chicken'
          }
        }
      },
      include: {
        storeSettings: true
      }
    })
    
    console.log(`  - Zonas a eliminar: ${zonesToDelete.length}`)
    zonesToDelete.forEach(zone => {
      console.log(`    🚚 ${zone.name} - ${zone.storeSettings.storeName}`)
    })
    
    if (zonesToDelete.length > 0) {
      await prisma.deliveryZone.deleteMany({
        where: {
          storeSettings: {
            storeName: {
              not: 'Nanixhe Chicken'
            }
          }
        }
      })
      console.log('  ✅ Zonas eliminadas')
    }
    
    // 3. Eliminar configuraciones de tienda de prueba
    console.log('\n🏪 Eliminando configuraciones de tienda de prueba...')
    const settingsToDelete = await prisma.storeSettings.findMany({
      where: {
        storeName: {
          not: 'Nanixhe Chicken'
        }
      }
    })
    
    console.log(`  - Configuraciones a eliminar: ${settingsToDelete.length}`)
    settingsToDelete.forEach(settings => {
      console.log(`    🏪 ${settings.storeName} (${settings.storeSlug})`)
    })
    
    if (settingsToDelete.length > 0) {
      await prisma.storeSettings.deleteMany({
        where: {
          storeName: {
            not: 'Nanixhe Chicken'
          }
        }
      })
      console.log('  ✅ Configuraciones eliminadas')
    }
    
    // 4. Eliminar usuarios de prueba
    console.log('\n👤 Eliminando usuarios de prueba...')
    if (usersToDelete.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: usersToDelete.map(u => u.id)
          }
        }
      })
      console.log('  ✅ Usuarios eliminados')
    }
    
    // 5. Verificar estado final
    console.log('\n📊 Estado final de la base de datos:')
    
    const finalUsers = await prisma.user.findMany({
      include: {
        storeSettings: true,
        products: true,
        categories: true
      }
    })
    
    console.log(`  - Total de usuarios: ${finalUsers.length}`)
    finalUsers.forEach(user => {
      console.log(`    👤 ${user.name || user.email} (${user.role})`)
      if (user.storeSettings) {
        console.log(`      - Tienda: ${user.storeSettings.storeName}`)
        console.log(`      - Productos: ${user.products.length}`)
        console.log(`      - Categorías: ${user.categories.length}`)
      }
    })
    
    const finalZones = await prisma.deliveryZone.findMany({
      include: {
        storeSettings: true
      }
    })
    
    console.log(`\n  - Total de zonas de entrega: ${finalZones.length}`)
    finalZones.forEach(zone => {
      console.log(`    🚚 ${zone.name} - ${zone.storeSettings.storeName}`)
    })
    
    console.log('\n🎉 Limpieza completada exitosamente!')
    console.log('✅ Solo quedan:')
    console.log('  - 1 Admin')
    console.log('  - 1 Cliente (Nanixhe Chicken)')
    console.log('  - 4 Zonas de entrega de Nanixhe Chicken')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTestData()
