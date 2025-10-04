import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function dropColumns() {
  try {
    console.log('🔄 Eliminando columnas obsoletas...')

    // Eliminar categoryName
    await prisma.$executeRaw`ALTER TABLE products DROP COLUMN categoryName`
    console.log('✅ Eliminada columna categoryName')

    // Eliminar categoryId
    await prisma.$executeRaw`ALTER TABLE products DROP COLUMN categoryId`
    console.log('✅ Eliminada columna categoryId')

    console.log('✅ Columnas eliminadas exitosamente!')

    // Verificar estructura final
    const tableInfo = await prisma.$queryRaw`PRAGMA table_info(products)`
    console.log('📊 Estructura final de la tabla products:')
    console.log(tableInfo)

  } catch (error) {
    console.error('❌ Error eliminando columnas:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

dropColumns()
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
