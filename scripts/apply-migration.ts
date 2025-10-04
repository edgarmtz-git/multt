import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('🔄 Aplicando migración para eliminar campos obsoletos...')

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250123000000_remove_obsolete_category_fields/migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Ejecutar la migración usando $executeRaw
    await prisma.$executeRawUnsafe(migrationSQL)

    console.log('✅ Migración aplicada exitosamente!')

    // Verificar que los campos fueron eliminados
    const tableInfo = await prisma.$queryRaw`PRAGMA table_info(products)`
    console.log('📊 Estructura actual de la tabla products:')
    console.log(tableInfo)

  } catch (error) {
    console.error('❌ Error aplicando migración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
