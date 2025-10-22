import { prisma } from '../lib/prisma'

async function testHoursConfig() {
  console.log('🕐 Testing hours configuration...')

  try {
    // Buscar la tienda de prueba
    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeSlug: 'lacasadelsabor'
      },
      select: {
        id: true,
        storeName: true,
        storeSlug: true,
        enableBusinessHours: true,
        serviceHours: true,
        unifiedSchedule: true
      }
    })

    if (!storeSettings) {
      console.log('❌ Store not found')
      return
    }

    console.log('🏪 Store found:', {
      id: storeSettings.id,
      storeName: storeSettings.storeName,
      storeSlug: storeSettings.storeSlug,
      enableBusinessHours: storeSettings.enableBusinessHours
    })

    console.log('\n📋 Current configuration:')
    console.log('  enableBusinessHours:', storeSettings.enableBusinessHours)
    console.log('  serviceHours:', storeSettings.serviceHours)
    console.log('  unifiedSchedule:', storeSettings.unifiedSchedule)

    // Configurar horarios de prueba si no existen
    if (!storeSettings.enableBusinessHours) {
      console.log('\n🔧 Enabling business hours...')
      
      const testSchedule = {
        sunday: { isOpen: true, openTime: "11:00", closeTime: "21:00" },
        monday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
        tuesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
        wednesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
        thursday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
        friday: { isOpen: true, openTime: "09:00", closeTime: "23:00" },
        saturday: { isOpen: true, openTime: "10:00", closeTime: "23:00" }
      }

      await prisma.storeSettings.update({
        where: { id: storeSettings.id },
        data: {
          enableBusinessHours: true,
          serviceHours: JSON.stringify(testSchedule)
        }
      })

      console.log('✅ Business hours enabled with test schedule')
    }

    // Verificar la configuración actualizada
    const updatedSettings = await prisma.storeSettings.findFirst({
      where: { id: storeSettings.id },
      select: {
        enableBusinessHours: true,
        serviceHours: true,
        unifiedSchedule: true
      }
    })

    console.log('\n✅ Updated configuration:')
    console.log('  enableBusinessHours:', updatedSettings?.enableBusinessHours)
    console.log('  serviceHours:', updatedSettings?.serviceHours)
    console.log('  unifiedSchedule:', updatedSettings?.unifiedSchedule)

    // Probar la lógica de horarios
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todaySchedule = JSON.parse(updatedSettings?.serviceHours || '{}')[dayNames[currentDay]]

    console.log('\n🕐 Current time check:')
    console.log('  Current day:', currentDay, `(${dayNames[currentDay]})`)
    console.log('  Current time:', currentTime)
    console.log('  Today schedule:', todaySchedule)

    if (todaySchedule?.isOpen) {
      const openTime = parseInt(todaySchedule.openTime.replace(':', ''))
      const closeTime = parseInt(todaySchedule.closeTime.replace(':', ''))
      const isOpen = currentTime >= openTime && currentTime <= closeTime
      
      console.log('  Open time:', openTime)
      console.log('  Close time:', closeTime)
      console.log('  Is open now:', isOpen)
    } else {
      console.log('  Store is closed today')
    }

  } catch (error) {
    console.error('❌ Error testing hours config:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testHoursConfig()
