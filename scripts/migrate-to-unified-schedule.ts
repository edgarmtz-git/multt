import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToUnifiedSchedule() {
  try {
    console.log('🔄 Migrando a sistema unificado de horarios...\n')
    
    // 1. Obtener configuraciones existentes
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
    
    console.log(`📋 Configuraciones encontradas: ${storeSettings.length}`)
    
    // 2. Migrar cada configuración
    for (const store of storeSettings) {
      console.log(`\n🏪 Migrando ${store.storeName}...`)
      
      // Crear estructura unificada
      const unifiedSchedule = {
        operatingHours: {},
        deliveryOptions: {
          enabled: store.deliveryScheduleEnabled || false,
          immediate: true,
          scheduled: store.deliveryScheduleEnabled || false,
          pickup: true,
          minAdvanceHours: 1,
          maxAdvanceDays: store.advanceDays || 1,
          useOperatingHours: true
        },
        exceptions: []
      }
      
      // Migrar horarios comerciales
      if (store.enableBusinessHours && store.businessHours) {
        try {
          const businessHours = store.businessHours as any
          Object.keys(businessHours).forEach(day => {
            if (Array.isArray(businessHours[day]) && businessHours[day].length > 0) {
              unifiedSchedule.operatingHours[day] = {
                isOpen: true,
                periods: businessHours[day].map((period: any) => ({
                  open: period.open,
                  close: period.close
                }))
              }
            } else {
              unifiedSchedule.operatingHours[day] = {
                isOpen: false,
                periods: []
              }
            }
          })
          console.log(`  ✅ Horarios comerciales migrados`)
        } catch (error) {
          console.log(`  ⚠️  Error migrando horarios comerciales: ${error}`)
          // Crear horarios por defecto
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          days.forEach(day => {
            unifiedSchedule.operatingHours[day] = {
              isOpen: day !== 'sunday',
              periods: day !== 'sunday' ? [{ open: '09:00', close: '22:00' }] : []
            }
          })
        }
      } else {
        // Crear horarios por defecto
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        days.forEach(day => {
          unifiedSchedule.operatingHours[day] = {
            isOpen: day !== 'sunday',
            periods: day !== 'sunday' ? [{ open: '09:00', close: '22:00' }] : []
          }
        })
        console.log(`  ✅ Horarios por defecto creados`)
      }
      
      // Migrar horarios de servicio si existen
      if (store.serviceHours) {
        try {
          const serviceHours = store.serviceHours as any
          // Si hay horarios de servicio específicos, no usar horarios de operación
          if (Object.keys(serviceHours).length > 0) {
            unifiedSchedule.deliveryOptions.useOperatingHours = false
            console.log(`  ✅ Horarios de servicio específicos detectados`)
          }
        } catch (error) {
          console.log(`  ⚠️  Error procesando horarios de servicio: ${error}`)
        }
      }
      
      // Actualizar la configuración
      await prisma.storeSettings.update({
        where: { id: store.id },
        data: {
          unifiedSchedule: unifiedSchedule
        }
      })
      
      console.log(`  ✅ Configuración unificada creada`)
      console.log(`    - Horarios de operación: ${Object.keys(unifiedSchedule.operatingHours).length} días`)
      console.log(`    - Entregas habilitadas: ${unifiedSchedule.deliveryOptions.enabled}`)
      console.log(`    - Tipo: ${unifiedSchedule.deliveryOptions.scheduled ? 'Programada' : 'Inmediata'}`)
    }
    
    console.log('\n🎉 Migración completada exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`  - Configuraciones migradas: ${storeSettings.length}`)
    console.log(`  - Sistema unificado implementado`)
    console.log(`  - Compatibilidad mantenida`)
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateToUnifiedSchedule()
