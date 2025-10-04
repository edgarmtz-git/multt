import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDeliveryScheduleFields() {
  try {
    console.log('🔍 Verificando campos de horarios de entrega...')
    
    // Verificar que la tabla StoreSettings tiene los nuevos campos
    const result = await prisma.$queryRaw`
      PRAGMA table_info(store_settings);
    `
    
    console.log('📋 Campos en la tabla store_settings:')
    console.table(result)
    
    // Buscar los campos específicos de horarios de entrega
    const deliveryScheduleFields = [
      'deliveryScheduleEnabled',
      'scheduleType', 
      'advanceDays',
      'serviceHours'
    ]
    
    console.log('\n✅ Campos de horarios de entrega encontrados:')
    deliveryScheduleFields.forEach(field => {
      const found = result.some((row: any) => row.name === field)
      console.log(`  ${found ? '✅' : '❌'} ${field}`)
    })
    
    // Verificar que podemos crear un registro con los nuevos campos
    console.log('\n🧪 Probando inserción de datos...')
    
    const testSettings = await prisma.storeSettings.create({
      data: {
        userId: 'test-user-id',
        storeName: 'Tienda de Prueba',
        storeSlug: 'tienda-prueba-horarios',
        deliveryScheduleEnabled: true,
        scheduleType: 'datetime',
        advanceDays: 2,
        serviceHours: {
          monday: [{ open: '09:00', close: '18:00' }],
          tuesday: [{ open: '09:00', close: '18:00' }],
          wednesday: [{ open: '09:00', close: '18:00' }],
          thursday: [{ open: '09:00', close: '18:00' }],
          friday: [{ open: '09:00', close: '18:00' }],
          saturday: [{ open: '10:00', close: '16:00' }],
          sunday: []
        }
      }
    })
    
    console.log('✅ Registro de prueba creado exitosamente:')
    console.log(`  - ID: ${testSettings.id}`)
    console.log(`  - Horarios habilitados: ${testSettings.deliveryScheduleEnabled}`)
    console.log(`  - Tipo de selector: ${testSettings.scheduleType}`)
    console.log(`  - Días de anticipación: ${testSettings.advanceDays}`)
    console.log(`  - Horarios de servicio: ${JSON.stringify(testSettings.serviceHours, null, 2)}`)
    
    // Limpiar el registro de prueba
    await prisma.storeSettings.delete({
      where: { id: testSettings.id }
    })
    
    console.log('\n🧹 Registro de prueba eliminado')
    console.log('\n🎉 ¡Todos los campos de horarios de entrega están funcionando correctamente!')
    
  } catch (error) {
    console.error('❌ Error verificando campos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDeliveryScheduleFields()
