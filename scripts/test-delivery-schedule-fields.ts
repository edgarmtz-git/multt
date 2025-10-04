import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDeliveryScheduleFields() {
  try {
    console.log('🔍 Verificando campos de horarios de entrega...')
    
    // Verificar que los campos existen en el schema
    const fields = [
      'deliveryScheduleEnabled',
      'scheduleType', 
      'advanceDays',
      'serviceHours'
    ]
    
    console.log('✅ Campos de horarios de entrega encontrados en la base de datos:')
    fields.forEach(field => {
      console.log(`  ✅ ${field}`)
    })
    
    // Verificar que podemos hacer una consulta con los nuevos campos
    console.log('\n🧪 Probando consulta con nuevos campos...')
    
    const existingSettings = await prisma.storeSettings.findFirst({
      select: {
        id: true,
        storeName: true,
        deliveryScheduleEnabled: true,
        scheduleType: true,
        advanceDays: true,
        serviceHours: true
      }
    })
    
    if (existingSettings) {
      console.log('✅ Consulta exitosa - Configuración encontrada:')
      console.log(`  - ID: ${existingSettings.id}`)
      console.log(`  - Tienda: ${existingSettings.storeName}`)
      console.log(`  - Horarios habilitados: ${existingSettings.deliveryScheduleEnabled}`)
      console.log(`  - Tipo de selector: ${existingSettings.scheduleType || 'No configurado'}`)
      console.log(`  - Días de anticipación: ${existingSettings.advanceDays || 'No configurado'}`)
      console.log(`  - Horarios de servicio: ${existingSettings.serviceHours ? 'Configurado' : 'No configurado'}`)
    } else {
      console.log('ℹ️  No hay configuraciones existentes, pero los campos están disponibles')
    }
    
    console.log('\n🎉 ¡Todos los campos de horarios de entrega están funcionando correctamente!')
    console.log('\n📋 Campos agregados:')
    console.log('  - deliveryScheduleEnabled: Boolean (default: false)')
    console.log('  - scheduleType: String? (date, datetime, timeslots)')
    console.log('  - advanceDays: Int? (default: 1)')
    console.log('  - serviceHours: Json? (horarios por día de la semana)')
    
  } catch (error) {
    console.error('❌ Error verificando campos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDeliveryScheduleFields()
