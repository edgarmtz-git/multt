import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function demoUnifiedSchedule() {
  try {
    console.log('🎯 DEMO: Sistema Unificado de Horarios\n')
    
    // 1. Obtener configuración actual
    const storeSettings = await prisma.storeSettings.findFirst({
      select: {
        id: true,
        storeName: true,
        unifiedSchedule: true
      }
    })
    
    if (!storeSettings) {
      console.log('❌ No se encontró configuración de tienda')
      return
    }
    
    console.log(`🏪 Tienda: ${storeSettings.storeName}`)
    console.log(`📅 Configuración unificada: ${storeSettings.unifiedSchedule ? '✅ Configurada' : '❌ No configurada'}`)
    
    if (storeSettings.unifiedSchedule) {
      const schedule = storeSettings.unifiedSchedule as any
      
      console.log('\n📋 CONFIGURACIÓN ACTUAL:')
      console.log('')
      
      // Mostrar horarios de operación
      console.log('🕒 HORARIOS DE OPERACIÓN:')
      Object.keys(schedule.operatingHours).forEach(day => {
        const dayConfig = schedule.operatingHours[day]
        const dayNames = {
          monday: 'Lunes',
          tuesday: 'Martes', 
          wednesday: 'Miércoles',
          thursday: 'Jueves',
          friday: 'Viernes',
          saturday: 'Sábado',
          sunday: 'Domingo'
        }
        
        if (dayConfig.isOpen) {
          const periods = dayConfig.periods.map((p: any) => `${p.open}-${p.close}`).join(', ')
          console.log(`  ✅ ${dayNames[day as keyof typeof dayNames]}: ${periods}`)
        } else {
          console.log(`  ❌ ${dayNames[day as keyof typeof dayNames]}: Cerrado`)
        }
      })
      
      // Mostrar opciones de entrega
      console.log('\n🚚 OPCIONES DE ENTREGA:')
      console.log(`  - Habilitadas: ${schedule.deliveryOptions.enabled ? '✅' : '❌'}`)
      console.log(`  - Inmediata: ${schedule.deliveryOptions.immediate ? '✅' : '❌'}`)
      console.log(`  - Programada: ${schedule.deliveryOptions.scheduled ? '✅' : '❌'}`)
      console.log(`  - Recogida: ${schedule.deliveryOptions.pickup ? '✅' : '❌'}`)
      console.log(`  - Anticipación mínima: ${schedule.deliveryOptions.minAdvanceHours} hora(s)`)
      console.log(`  - Anticipación máxima: ${schedule.deliveryOptions.maxAdvanceDays} día(s)`)
      console.log(`  - Usar horarios de operación: ${schedule.deliveryOptions.useOperatingHours ? '✅' : '❌'}`)
      
      // Simular verificación de disponibilidad
      console.log('\n🧪 SIMULACIÓN DE VERIFICACIÓN:')
      const now = new Date()
      const currentHour = now.getHours()
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()]
      
      console.log(`  📅 Fecha actual: ${now.toLocaleDateString('es-ES')}`)
      console.log(`  🕒 Hora actual: ${currentHour}:${now.getMinutes().toString().padStart(2, '0')}`)
      console.log(`  📆 Día actual: ${currentDay}`)
      
      // Verificar si está abierto
      const todayConfig = schedule.operatingHours[currentDay]
      let isOpen = false
      let currentPeriod = null
      
      if (todayConfig.isOpen) {
        for (const period of todayConfig.periods) {
          const [openHour, openMin] = period.open.split(':').map(Number)
          const [closeHour, closeMin] = period.close.split(':').map(Number)
          const openTime = openHour * 60 + openMin
          const closeTime = closeHour * 60 + closeMin
          const currentTime = currentHour * 60 + now.getMinutes()
          
          if (currentTime >= openTime && currentTime <= closeTime) {
            isOpen = true
            currentPeriod = period
            break
          }
        }
      }
      
      console.log(`  🏪 Estado: ${isOpen ? '✅ ABIERTO' : '❌ CERRADO'}`)
      if (currentPeriod) {
        console.log(`  ⏰ Horario actual: ${currentPeriod.open} - ${currentPeriod.close}`)
      }
      
      // Verificar opciones de entrega
      if (schedule.deliveryOptions.enabled) {
        console.log('\n🚚 OPCIONES DE ENTREGA DISPONIBLES:')
        
        if (schedule.deliveryOptions.immediate && isOpen) {
          console.log('  ✅ Entrega inmediata disponible')
        } else if (schedule.deliveryOptions.immediate && !isOpen) {
          console.log('  ❌ Entrega inmediata no disponible (cerrado)')
        }
        
        if (schedule.deliveryOptions.scheduled) {
          console.log('  ✅ Entrega programada disponible')
          console.log(`    - Mínimo: ${schedule.deliveryOptions.minAdvanceHours} hora(s) de anticipación`)
          console.log(`    - Máximo: ${schedule.deliveryOptions.maxAdvanceDays} día(s) de anticipación`)
        }
        
        if (schedule.deliveryOptions.pickup) {
          console.log('  ✅ Recogida en tienda disponible')
        }
      } else {
        console.log('  ❌ Entregas no habilitadas')
      }
      
      // Ejemplo de uso en el frontend
      console.log('\n💻 EJEMPLO DE USO EN EL FRONTEND:')
      console.log('')
      console.log('```typescript')
      console.log('// 1. Obtener configuración')
      console.log('const response = await fetch("/api/dashboard/settings")')
      console.log('const settings = await response.json()')
      console.log('const schedule = settings.unifiedSchedule')
      console.log('')
      console.log('// 2. Verificar disponibilidad')
      console.log('function isStoreOpen(schedule, date) {')
      console.log('  const day = getDayName(date)')
      console.log('  const dayConfig = schedule.operatingHours[day]')
      console.log('  if (!dayConfig.isOpen) return false')
      console.log('  ')
      console.log('  const hour = date.getHours()')
      console.log('  const minute = date.getMinutes()')
      console.log('  const currentTime = hour * 60 + minute')
      console.log('  ')
      console.log('  return dayConfig.periods.some(period => {')
      console.log('    const [openHour, openMin] = period.open.split(":").map(Number)')
      console.log('    const [closeHour, closeMin] = period.close.split(":").map(Number)')
      console.log('    const openTime = openHour * 60 + openMin')
      console.log('    const closeTime = closeHour * 60 + closeMin')
      console.log('    return currentTime >= openTime && currentTime <= closeTime')
      console.log('  })')
      console.log('}')
      console.log('')
      console.log('// 3. Verificar opciones de entrega')
      console.log('function getDeliveryOptions(schedule, date) {')
      console.log('  const options = []')
      console.log('  ')
      console.log('  if (schedule.deliveryOptions.immediate && isStoreOpen(schedule, date)) {')
      console.log('    options.push("immediate")')
      console.log('  }')
      console.log('  ')
      console.log('  if (schedule.deliveryOptions.scheduled) {')
      console.log('    options.push("scheduled")')
      console.log('  }')
      console.log('  ')
      console.log('  if (schedule.deliveryOptions.pickup) {')
      console.log('    options.push("pickup")')
      console.log('  }')
      console.log('  ')
      console.log('  return options')
      console.log('}')
      console.log('```')
      
      console.log('\n📍 DÓNDE ENCONTRAR EL SISTEMA:')
      console.log('')
      console.log('1. 🏪 Configuración de la tienda:')
      console.log('   - URL: http://localhost:3000/dashboard/settings')
      console.log('   - Pestaña: "Entregas"')
      console.log('   - Sección: "Horarios de entrega"')
      console.log('')
      console.log('2. 📅 Gestión de disponibilidad:')
      console.log('   - URL: http://localhost:3000/dashboard/availability')
      console.log('   - Interfaz unificada para horarios')
      console.log('')
      console.log('3. 🗄️ Base de datos:')
      console.log('   - Tabla: store_settings')
      console.log('   - Campo: unifiedSchedule (JSON)')
      console.log('   - Prisma Studio: http://localhost:5556')
      console.log('')
      console.log('4. 🔧 API:')
      console.log('   - GET /api/dashboard/settings - Obtener configuración')
      console.log('   - PUT /api/dashboard/settings - Actualizar configuración')
      console.log('   - GET /api/availability/check - Verificar disponibilidad')
      
    } else {
      console.log('\n⚠️  La tienda no tiene configuración unificada')
      console.log('   Ejecuta: npx tsx scripts/setup-unified-schedule.ts')
    }
    
    console.log('\n🎉 Demo completada!')
    
  } catch (error) {
    console.error('❌ Error en demo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

demoUnifiedSchedule()
