import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeAvailabilityIntegrity() {
  try {
    console.log('🔍 Analizando integridad entre tabla del restaurante y sistema de horarios...\n')
    
    // 1. Verificar configuración de horarios comerciales
    console.log('🏪 CONFIGURACIÓN DE HORARIOS COMERCIALES:')
    const storeSettings = await prisma.storeSettings.findMany({
      select: {
        id: true,
        storeName: true,
        enableBusinessHours: true,
        businessHours: true,
        deliveryScheduleEnabled: true,
        scheduleType: true,
        advanceDays: true,
        serviceHours: true
      }
    })
    
    console.log(`  - Total de configuraciones: ${storeSettings.length}`)
    storeSettings.forEach(store => {
      console.log(`    🏪 ${store.storeName}`)
      console.log(`      - Horarios comerciales habilitados: ${store.enableBusinessHours ? '✅' : '❌'}`)
      console.log(`      - Horarios comerciales configurados: ${store.businessHours ? '✅' : '❌'}`)
      console.log(`      - Horarios de entrega habilitados: ${store.deliveryScheduleEnabled ? '✅' : '❌'}`)
      console.log(`      - Tipo de selector: ${store.scheduleType || 'No configurado'}`)
      console.log(`      - Días de anticipación: ${store.advanceDays || 'No configurado'}`)
      console.log(`      - Horarios de servicio: ${store.serviceHours ? '✅' : '❌'}`)
      
      if (store.businessHours) {
        console.log(`        📅 Horarios comerciales:`)
        const hours = store.businessHours as any
        Object.keys(hours).forEach(day => {
          if (Array.isArray(hours[day]) && hours[day].length > 0) {
            hours[day].forEach((period: any) => {
              console.log(`          - ${day}: ${period.open} - ${period.close}`)
            })
          }
        })
      }
      
      if (store.serviceHours) {
        console.log(`        🚚 Horarios de servicio:`)
        const serviceHours = store.serviceHours as any
        Object.keys(serviceHours).forEach(day => {
          if (Array.isArray(serviceHours[day]) && serviceHours[day].length > 0) {
            serviceHours[day].forEach((period: any) => {
              console.log(`          - ${day}: ${period.open} - ${period.close}`)
            })
          }
        })
      }
    })
    
    // 2. Verificar consistencia entre horarios comerciales y de entrega
    console.log('\n🔗 CONSISTENCIA ENTRE HORARIOS:')
    storeSettings.forEach(store => {
      const hasBusinessHours = store.enableBusinessHours && store.businessHours
      const hasDeliverySchedule = store.deliveryScheduleEnabled && store.serviceHours
      
      console.log(`  🏪 ${store.storeName}:`)
      console.log(`    - Horarios comerciales: ${hasBusinessHours ? '✅' : '❌'}`)
      console.log(`    - Horarios de entrega: ${hasDeliverySchedule ? '✅' : '❌'}`)
      
      if (hasBusinessHours && hasDeliverySchedule) {
        console.log(`    - ✅ Ambos sistemas configurados`)
      } else if (hasBusinessHours && !hasDeliverySchedule) {
        console.log(`    - ⚠️  Solo horarios comerciales configurados`)
      } else if (!hasBusinessHours && hasDeliverySchedule) {
        console.log(`    - ⚠️  Solo horarios de entrega configurados`)
      } else {
        console.log(`    - ❌ Ningún sistema de horarios configurado`)
      }
    })
    
    // 3. Verificar integridad de datos
    console.log('\n📊 INTEGRIDAD DE DATOS:')
    
    // Verificar que los horarios comerciales tienen formato correcto
    const invalidBusinessHours = storeSettings.filter(store => {
      if (!store.businessHours) return false
      try {
        const hours = store.businessHours as any
        return !hours || typeof hours !== 'object'
      } catch {
        return true
      }
    })
    
    console.log(`  - Horarios comerciales con formato inválido: ${invalidBusinessHours.length}`)
    
    // Verificar que los horarios de servicio tienen formato correcto
    const invalidServiceHours = storeSettings.filter(store => {
      if (!store.serviceHours) return false
      try {
        const hours = store.serviceHours as any
        return !hours || typeof hours !== 'object'
      } catch {
        return true
      }
    })
    
    console.log(`  - Horarios de servicio con formato inválido: ${invalidServiceHours.length}`)
    
    // 4. Recomendaciones
    console.log('\n💡 RECOMENDACIONES:')
    
    const storesWithoutBusinessHours = storeSettings.filter(s => !s.enableBusinessHours)
    const storesWithoutDeliverySchedule = storeSettings.filter(s => !s.deliveryScheduleEnabled)
    
    if (storesWithoutBusinessHours.length > 0) {
      console.log(`  ⚠️  ${storesWithoutBusinessHours.length} tienda(s) sin horarios comerciales configurados`)
      storesWithoutBusinessHours.forEach(store => {
        console.log(`    - ${store.storeName}`)
      })
    }
    
    if (storesWithoutDeliverySchedule.length > 0) {
      console.log(`  ⚠️  ${storesWithoutDeliverySchedule.length} tienda(s) sin horarios de entrega configurados`)
      storesWithoutDeliverySchedule.forEach(store => {
        console.log(`    - ${store.storeName}`)
      })
    }
    
    // 5. Resumen de integridad
    console.log('\n📋 RESUMEN DE INTEGRIDAD:')
    const totalStores = storeSettings.length
    const storesWithBusinessHours = storeSettings.filter(s => s.enableBusinessHours && s.businessHours).length
    const storesWithDeliverySchedule = storeSettings.filter(s => s.deliveryScheduleEnabled && s.serviceHours).length
    const storesWithBoth = storeSettings.filter(s => 
      s.enableBusinessHours && s.businessHours && 
      s.deliveryScheduleEnabled && s.serviceHours
    ).length
    
    console.log(`  - Total de tiendas: ${totalStores}`)
    console.log(`  - Con horarios comerciales: ${storesWithBusinessHours}`)
    console.log(`  - Con horarios de entrega: ${storesWithDeliverySchedule}`)
    console.log(`  - Con ambos sistemas: ${storesWithBoth}`)
    
    if (storesWithBoth === totalStores) {
      console.log('  ✅ Todas las tiendas tienen ambos sistemas configurados')
    } else {
      console.log('  ⚠️  Algunas tiendas necesitan configuración adicional')
    }
    
    console.log('\n🎉 Análisis de integridad completado')
    
  } catch (error) {
    console.error('❌ Error analizando integridad:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeAvailabilityIntegrity()
