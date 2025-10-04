import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupUnifiedSchedule() {
  try {
    console.log('🔄 Configurando sistema unificado de horarios...\n')
    
    // 1. Obtener configuración existente
    const storeSettings = await prisma.storeSettings.findFirst({
      select: {
        id: true,
        storeName: true,
        enableBusinessHours: true,
        businessHours: true
      }
    })
    
    if (!storeSettings) {
      console.log('❌ No se encontró configuración de tienda')
      return
    }
    
    console.log(`🏪 Configurando ${storeSettings.storeName}...`)
    
    // 2. Crear configuración unificada
    const unifiedSchedule = {
      operatingHours: {
        monday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
        tuesday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
        wednesday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
        thursday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
        friday: { isOpen: true, periods: [{ open: "09:00", close: "23:00" }] },
        saturday: { isOpen: true, periods: [{ open: "10:00", close: "23:00" }] },
        sunday: { isOpen: true, periods: [{ open: "11:00", close: "21:00" }] }
      },
      deliveryOptions: {
        enabled: true,
        immediate: true,
        scheduled: true,
        pickup: true,
        minAdvanceHours: 1,
        maxAdvanceDays: 7,
        useOperatingHours: true
      },
      exceptions: []
    }
    
    // 3. Actualizar configuración
    await prisma.storeSettings.update({
      where: { id: storeSettings.id },
      data: {
        unifiedSchedule: unifiedSchedule
      }
    })
    
    console.log('✅ Sistema unificado configurado exitosamente!')
    console.log('\n📋 Configuración aplicada:')
    console.log('  🏪 Horarios de operación:')
    Object.keys(unifiedSchedule.operatingHours).forEach(day => {
      const dayConfig = unifiedSchedule.operatingHours[day]
      if (dayConfig.isOpen) {
        const periods = dayConfig.periods.map(p => `${p.open}-${p.close}`).join(', ')
        console.log(`    - ${day}: ${periods}`)
      } else {
        console.log(`    - ${day}: Cerrado`)
      }
    })
    
    console.log('\n  🚚 Opciones de entrega:')
    console.log(`    - Habilitadas: ${unifiedSchedule.deliveryOptions.enabled ? '✅' : '❌'}`)
    console.log(`    - Inmediata: ${unifiedSchedule.deliveryOptions.immediate ? '✅' : '❌'}`)
    console.log(`    - Programada: ${unifiedSchedule.deliveryOptions.scheduled ? '✅' : '❌'}`)
    console.log(`    - Recogida: ${unifiedSchedule.deliveryOptions.pickup ? '✅' : '❌'}`)
    console.log(`    - Anticipación mínima: ${unifiedSchedule.deliveryOptions.minAdvanceHours} hora(s)`)
    console.log(`    - Anticipación máxima: ${unifiedSchedule.deliveryOptions.maxAdvanceDays} día(s)`)
    console.log(`    - Usar horarios de operación: ${unifiedSchedule.deliveryOptions.useOperatingHours ? '✅' : '❌'}`)
    
    console.log('\n🎉 ¡Sistema unificado listo para usar!')
    
  } catch (error) {
    console.error('❌ Error configurando sistema unificado:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupUnifiedSchedule()
