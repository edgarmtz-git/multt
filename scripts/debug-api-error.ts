import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugAPIError() {
  try {
    console.log('🐛 DEBUGGEANDO ERROR DE API\n')
    
    const userId = 'cmfwsez430001s63iz8wh5xd2'
    
    console.log('1. Verificando usuario...')
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })
    
    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }
    
    console.log(`✅ Usuario encontrado: ${user.name} (${user.email})`)
    
    console.log('\n2. Verificando StoreSettings...')
    const storeSettings = await prisma.storeSettings.findFirst({
      where: { userId },
      select: {
        id: true,
        storeName: true,
        unifiedSchedule: true
      }
    })
    
    if (!storeSettings) {
      console.log('❌ StoreSettings no encontrado')
      return
    }
    
    console.log(`✅ StoreSettings encontrado: ${storeSettings.storeName}`)
    console.log(`📅 unifiedSchedule: ${storeSettings.unifiedSchedule ? '✅' : '❌'}`)
    
    if (storeSettings.unifiedSchedule) {
      const schedule = storeSettings.unifiedSchedule as any
      
      console.log('\n3. Verificando estructura del schedule...')
      console.log(`   - operatingHours: ${schedule.operatingHours ? '✅' : '❌'}`)
      console.log(`   - deliveryOptions: ${schedule.deliveryOptions ? '✅' : '❌'}`)
      
      if (schedule.operatingHours) {
        const days = Object.keys(schedule.operatingHours)
        console.log(`   - Días configurados: ${days.join(', ')}`)
      }
      
      if (schedule.deliveryOptions) {
        console.log(`   - enabled: ${schedule.deliveryOptions.enabled}`)
        console.log(`   - immediate: ${schedule.deliveryOptions.immediate}`)
        console.log(`   - scheduled: ${schedule.deliveryOptions.scheduled}`)
        console.log(`   - pickup: ${schedule.deliveryOptions.pickup}`)
      }
      
      console.log('\n4. Simulando lógica de verificación...')
      const now = new Date()
      const dayName = getDayName(now)
      const dayConfig = schedule.operatingHours[dayName]
      
      console.log(`   - Fecha actual: ${now.toISOString()}`)
      console.log(`   - Día: ${dayName}`)
      console.log(`   - Configuración del día: ${dayConfig ? '✅' : '❌'}`)
      
      if (dayConfig) {
        console.log(`   - Está abierto: ${dayConfig.isOpen}`)
        if (dayConfig.isOpen && dayConfig.periods) {
          console.log(`   - Períodos: ${dayConfig.periods.length}`)
          dayConfig.periods.forEach((period: any, index: number) => {
            console.log(`     ${index + 1}. ${period.open} - ${period.close}`)
          })
        }
      }
      
      console.log('\n✅ TODAS LAS VERIFICACIONES PASARON!')
      console.log('   El problema debe estar en el endpoint HTTP')
      
    } else {
      console.log('❌ unifiedSchedule es null/undefined')
    }
    
  } catch (error) {
    console.error('❌ Error en debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getDayName(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[date.getDay()]
}

debugAPIError()
