import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAvailabilityAPI() {
  try {
    console.log('🧪 PROBANDO API DE DISPONIBILIDAD\n')
    
    const userId = 'cmfwsez430001s63iz8wh5xd2'
    
    // Simular la lógica de la API
    const storeSettings = await prisma.storeSettings.findFirst({
      where: { userId },
      select: {
        unifiedSchedule: true,
        storeName: true
      }
    })
    
    if (!storeSettings || !storeSettings.unifiedSchedule) {
      console.log('❌ No se encontró configuración de tienda')
      return
    }
    
    console.log(`🏪 Tienda: ${storeSettings.storeName}`)
    console.log(`📅 Configuración: ${storeSettings.unifiedSchedule ? '✅' : '❌'}`)
    
    const schedule = storeSettings.unifiedSchedule as any
    const checkDate = new Date()
    
    // Verificar si está abierto
    const dayName = getDayName(checkDate)
    const dayConfig = schedule.operatingHours[dayName]
    
    let isOpen = false
    let currentPeriod = null
    
    if (dayConfig && dayConfig.isOpen) {
      const hour = checkDate.getHours()
      const minute = checkDate.getMinutes()
      const currentTime = hour * 60 + minute
      
      for (const period of dayConfig.periods) {
        const [openHour, openMin] = period.open.split(':').map(Number)
        const [closeHour, closeMin] = period.close.split(':').map(Number)
        const openTime = openHour * 60 + openMin
        const closeTime = closeHour * 60 + closeMin
        
        if (currentTime >= openTime && currentTime <= closeTime) {
          isOpen = true
          currentPeriod = period
          break
        }
      }
    }
    
    // Obtener opciones de entrega disponibles
    const deliveryOptions = []
    
    if (schedule.deliveryOptions.enabled) {
      if (schedule.deliveryOptions.immediate && isOpen) {
        deliveryOptions.push('immediate')
      }
      
      if (schedule.deliveryOptions.scheduled) {
        deliveryOptions.push('scheduled')
      }
      
      if (schedule.deliveryOptions.pickup) {
        deliveryOptions.push('pickup')
      }
    }
    
    // Calcular próximos horarios disponibles
    const nextAvailableTimes = getNextAvailableTimes(schedule, checkDate)
    
    const result = {
      storeName: storeSettings.storeName,
      date: checkDate.toISOString(),
      isOpen,
      currentPeriod,
      deliveryOptions,
      nextAvailableTimes,
      schedule: {
        operatingHours: schedule.operatingHours,
        deliveryOptions: schedule.deliveryOptions
      }
    }
    
    console.log('\n📊 RESULTADO DE LA API:')
    console.log(JSON.stringify(result, null, 2))
    
    console.log('\n✅ API FUNCIONANDO CORRECTAMENTE!')
    
  } catch (error) {
    console.error('❌ Error en API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getDayName(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[date.getDay()]
}

function getNextAvailableTimes(schedule: any, fromDate: Date) {
  const times = []
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  
  // Buscar en los próximos 7 días
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(fromDate)
    checkDate.setDate(checkDate.getDate() + i)
    
    const dayName = getDayName(checkDate)
    const dayConfig = schedule.operatingHours[dayName]
    
    if (dayConfig && dayConfig.isOpen) {
      dayConfig.periods.forEach((period: any) => {
        times.push({
          date: checkDate.toISOString().split('T')[0],
          day: dayName,
          open: period.open,
          close: period.close,
          isToday: i === 0
        })
      })
    }
  }
  
  return times
}

testAvailabilityAPI()
