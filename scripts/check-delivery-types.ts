import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDeliveryTypes() {
  try {
    console.log('🔍 Verificando tipos de entrega en la base de datos...')
    
    // Verificar qué tipos hay en la base de datos
    const result = await prisma.$queryRaw`
      SELECT DISTINCT type FROM delivery_zones;
    `
    
    console.log('📋 Tipos de entrega encontrados:')
    console.table(result)
    
    // Verificar si hay zonas con tipos no válidos
    const invalidTypes = await prisma.$queryRaw`
      SELECT * FROM delivery_zones WHERE type NOT IN ('FIXED');
    `
    
    if (Array.isArray(invalidTypes) && invalidTypes.length > 0) {
      console.log('\n⚠️  Zonas con tipos no válidos:')
      console.table(invalidTypes)
      
      console.log('\n🔧 Solucionando tipos no válidos...')
      
      // Actualizar tipos no válidos a FIXED
      await prisma.$executeRaw`
        UPDATE delivery_zones SET type = 'FIXED' WHERE type NOT IN ('FIXED');
      `
      
      console.log('✅ Tipos actualizados a FIXED')
    } else {
      console.log('\n✅ Todos los tipos son válidos')
    }
    
  } catch (error) {
    console.error('❌ Error verificando tipos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDeliveryTypes()
