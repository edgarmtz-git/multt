import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDeliveryScheduleSave() {
  try {
    console.log('🧪 PROBANDO GUARDADO DE HORARIOS DE ENTREGA\n')
    
    const userId = 'cmfwsez430001s63iz8wh5xd2'
    
    // 1. Verificar configuración actual
    const currentSettings = await prisma.storeSettings.findFirst({
      where: { userId },
      select: {
        id: true,
        storeName: true,
        deliveryScheduleEnabled: true,
        scheduleType: true,
        advanceDays: true,
        serviceHours: true
      }
    })
    
    if (!currentSettings) {
      console.log('❌ No se encontró configuración de tienda')
      return
    }
    
    console.log('📊 CONFIGURACIÓN ACTUAL:')
    console.log(`  - deliveryScheduleEnabled: ${currentSettings.deliveryScheduleEnabled}`)
    console.log(`  - scheduleType: ${currentSettings.scheduleType}`)
    console.log(`  - advanceDays: ${currentSettings.advanceDays}`)
    console.log(`  - serviceHours: ${currentSettings.serviceHours}`)
    
    // 2. Simular actualización de horarios de entrega
    console.log('\n🔄 SIMULANDO ACTUALIZACIÓN...')
    
    const updatedSettings = await prisma.storeSettings.update({
      where: { id: currentSettings.id },
      data: {
        deliveryScheduleEnabled: true,
        scheduleType: 'datetime',
        advanceDays: 2,
        serviceHours: JSON.stringify({
          monday: { isOpen: true, periods: [{ open: '09:00', close: '22:00' }] },
          tuesday: { isOpen: true, periods: [{ open: '09:00', close: '22:00' }] },
          wednesday: { isOpen: true, periods: [{ open: '09:00', close: '22:00' }] },
          thursday: { isOpen: true, periods: [{ open: '09:00', close: '22:00' }] },
          friday: { isOpen: true, periods: [{ open: '09:00', close: '23:00' }] },
          saturday: { isOpen: true, periods: [{ open: '10:00', close: '23:00' }] },
          sunday: { isOpen: true, periods: [{ open: '11:00', close: '21:00' }] }
        })
      }
    })
    
    console.log('✅ CONFIGURACIÓN ACTUALIZADA:')
    console.log(`  - deliveryScheduleEnabled: ${updatedSettings.deliveryScheduleEnabled}`)
    console.log(`  - scheduleType: ${updatedSettings.scheduleType}`)
    console.log(`  - advanceDays: ${updatedSettings.advanceDays}`)
    console.log(`  - serviceHours: ${updatedSettings.serviceHours ? 'Configurado' : 'No configurado'}`)
    
    // 3. Verificar que se guardó correctamente
    const verifySettings = await prisma.storeSettings.findFirst({
      where: { userId },
      select: {
        deliveryScheduleEnabled: true,
        scheduleType: true,
        advanceDays: true,
        serviceHours: true
      }
    })
    
    console.log('\n🔍 VERIFICACIÓN:')
    console.log(`  - deliveryScheduleEnabled: ${verifySettings?.deliveryScheduleEnabled}`)
    console.log(`  - scheduleType: ${verifySettings?.scheduleType}`)
    console.log(`  - advanceDays: ${verifySettings?.advanceDays}`)
    console.log(`  - serviceHours: ${verifySettings?.serviceHours ? '✅ Guardado' : '❌ No guardado'}`)
    
    if (verifySettings?.deliveryScheduleEnabled && verifySettings?.scheduleType && verifySettings?.advanceDays) {
      console.log('\n🎉 ¡HORARIOS DE ENTREGA GUARDADOS CORRECTAMENTE!')
    } else {
      console.log('\n❌ Error al guardar horarios de entrega')
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDeliveryScheduleSave()
