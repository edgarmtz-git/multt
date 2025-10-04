import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllDeliveryZones() {
  try {
    console.log('🗑️ Eliminando todas las zonas de entrega...\n')
    
    // 1. Verificar zonas existentes
    const existingZones = await prisma.deliveryZone.findMany({
      include: {
        storeSettings: true
      }
    })
    
    console.log(`📋 Zonas de entrega encontradas: ${existingZones.length}`)
    existingZones.forEach(zone => {
      console.log(`  🚚 ${zone.name} - ${zone.storeSettings.storeName} - $${zone.fixedPrice || 0}`)
    })
    
    if (existingZones.length === 0) {
      console.log('✅ No hay zonas de entrega para eliminar')
      return
    }
    
    // 2. Eliminar todas las zonas
    console.log('\n🗑️ Eliminando todas las zonas...')
    const deleteResult = await prisma.deliveryZone.deleteMany({})
    
    console.log(`✅ ${deleteResult.count} zonas eliminadas`)
    
    // 3. Verificar que se eliminaron
    const remainingZones = await prisma.deliveryZone.findMany()
    console.log(`\n📊 Zonas restantes: ${remainingZones.length}`)
    
    if (remainingZones.length === 0) {
      console.log('🎉 ¡Todas las zonas de entrega han sido eliminadas exitosamente!')
    } else {
      console.log('⚠️  Aún quedan zonas por eliminar')
    }
    
    // 4. Verificar estado de la base de datos
    console.log('\n📋 Estado actual de la base de datos:')
    const users = await prisma.user.findMany({
      include: {
        storeSettings: {
          include: {
            deliveryZones: true
          }
        }
      }
    })
    
    users.forEach(user => {
      console.log(`  👤 ${user.name || user.email} (${user.role})`)
      if (user.storeSettings) {
        console.log(`    🏪 ${user.storeSettings.storeName}`)
        console.log(`    🚚 Zonas de entrega: ${user.storeSettings.deliveryZones.length}`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error eliminando zonas de entrega:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllDeliveryZones()
