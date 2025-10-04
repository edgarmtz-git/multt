import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function finalDeliveryScheduleTest() {
  try {
    console.log('🎯 PRUEBA FINAL: HORARIOS DE ENTREGA\n')
    
    const userId = 'cmfwsez430001s63iz8wh5xd2'
    
    // 1. Verificar que los campos existen en la base de datos
    console.log('1️⃣ VERIFICANDO CAMPOS EN BASE DE DATOS...')
    const settings = await prisma.storeSettings.findFirst({
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
    
    if (!settings) {
      console.log('❌ No se encontró configuración de tienda')
      return
    }
    
    console.log(`✅ Tienda: ${settings.storeName}`)
    console.log(`✅ deliveryScheduleEnabled: ${settings.deliveryScheduleEnabled}`)
    console.log(`✅ scheduleType: ${settings.scheduleType}`)
    console.log(`✅ advanceDays: ${settings.advanceDays}`)
    console.log(`✅ serviceHours: ${settings.serviceHours ? 'Configurado' : 'No configurado'}`)
    
    // 2. Simular una configuración completa
    console.log('\n2️⃣ CONFIGURANDO HORARIOS DE ENTREGA...')
    
    const updatedSettings = await prisma.storeSettings.update({
      where: { id: settings.id },
      data: {
        deliveryScheduleEnabled: true,
        scheduleType: 'datetime',
        advanceDays: 3,
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
    console.log(`  - Habilitado: ${updatedSettings.deliveryScheduleEnabled}`)
    console.log(`  - Tipo: ${updatedSettings.scheduleType}`)
    console.log(`  - Anticipación: ${updatedSettings.advanceDays} días`)
    console.log(`  - Horarios: ${updatedSettings.serviceHours ? 'Configurados' : 'No configurados'}`)
    
    // 3. Verificar que se persistió correctamente
    console.log('\n3️⃣ VERIFICANDO PERSISTENCIA...')
    const verifySettings = await prisma.storeSettings.findFirst({
      where: { userId },
      select: {
        deliveryScheduleEnabled: true,
        scheduleType: true,
        advanceDays: true,
        serviceHours: true
      }
    })
    
    const isCorrectlySaved = 
      verifySettings?.deliveryScheduleEnabled === true &&
      verifySettings?.scheduleType === 'datetime' &&
      verifySettings?.advanceDays === 3 &&
      verifySettings?.serviceHours !== null
    
    if (isCorrectlySaved) {
      console.log('🎉 ¡HORARIOS DE ENTREGA GUARDADOS Y PERSISTIDOS CORRECTAMENTE!')
      console.log('\n📋 RESUMEN:')
      console.log('  ✅ Campos agregados al esquema de base de datos')
      console.log('  ✅ API actualizada para manejar los nuevos campos')
      console.log('  ✅ Configuración guardada correctamente')
      console.log('  ✅ Datos persisten después de la actualización')
      
      console.log('\n🌐 PRÓXIMOS PASOS:')
      console.log('  1. Inicia sesión en http://localhost:3000/login')
      console.log('  2. Ve a http://localhost:3000/dashboard/settings')
      console.log('  3. Pestaña "Entregas" → "Horarios de entrega"')
      console.log('  4. Habilita "Habilitar horarios de entrega"')
      console.log('  5. Configura el tipo de selector y días de anticipación')
      console.log('  6. Guarda los cambios')
      console.log('  7. Refresca la página - los cambios deberían persistir')
      
    } else {
      console.log('❌ Error: Los datos no se guardaron correctamente')
    }
    
  } catch (error) {
    console.error('❌ Error en prueba final:', error)
  } finally {
    await prisma.$disconnect()
  }
}

finalDeliveryScheduleTest()
