import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUnifiedSchedule() {
  try {
    console.log('🔍 VERIFICANDO UNIFIED_SCHEDULE\n')
    
    const settings = await prisma.storeSettings.findFirst({
      select: {
        id: true,
        storeName: true,
        unifiedSchedule: true
      }
    })
    
    if (!settings) {
      console.log('❌ No se encontró configuración')
      return
    }
    
    console.log(`🏪 Tienda: ${settings.storeName}`)
    console.log(`📅 unifiedSchedule: ${settings.unifiedSchedule}`)
    console.log(`📅 Tipo: ${typeof settings.unifiedSchedule}`)
    
    if (settings.unifiedSchedule) {
      try {
        const parsed = JSON.parse(settings.unifiedSchedule as string)
        console.log('✅ JSON válido')
        console.log('📋 Estructura:', JSON.stringify(parsed, null, 2))
      } catch (error) {
        console.log('❌ Error al parsear JSON:', error)
        console.log('📄 Contenido crudo:', settings.unifiedSchedule)
      }
    } else {
      console.log('❌ unifiedSchedule es null/undefined')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUnifiedSchedule()
