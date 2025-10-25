#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Script para aplicar la migración de Float a Decimal
 * 1. Crea backup del schema actual
 * 2. Reemplaza el schema con la versión Decimal
 * 3. Genera migración de Prisma
 * 4. Aplica la migración
 */

async function createSchemaBackup(): Promise<void> {
  console.log('💾 Creando backup del schema actual...')
  
  try {
    const currentSchema = await fs.readFile('prisma/schema.prisma', 'utf-8')
    const backupPath = `prisma/schema-backup-${Date.now()}.prisma`
    await fs.writeFile(backupPath, currentSchema)
    
    console.log(`   ✅ Backup creado: ${backupPath}`)
  } catch (error) {
    console.error('❌ Error creando backup:', error)
    throw error
  }
}

async function applyDecimalSchema(): Promise<void> {
  console.log('🔄 Aplicando schema con Decimal...')
  
  try {
    const decimalSchema = await fs.readFile('prisma/schema-decimal.prisma', 'utf-8')
    await fs.writeFile('prisma/schema.prisma', decimalSchema)
    
    console.log('   ✅ Schema actualizado a Decimal')
  } catch (error) {
    console.error('❌ Error aplicando schema:', error)
    throw error
  }
}

async function generateMigration(): Promise<void> {
  console.log('📝 Generando migración de Prisma...')
  
  try {
    execSync('npx prisma migrate dev --name migrate_float_to_decimal', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    console.log('   ✅ Migración generada')
  } catch (error) {
    console.error('❌ Error generando migración:', error)
    throw error
  }
}

async function generateClient(): Promise<void> {
  console.log('🔧 Generando cliente de Prisma...')
  
  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    console.log('   ✅ Cliente generado')
  } catch (error) {
    console.error('❌ Error generando cliente:', error)
    throw error
  }
}

async function validateMigration(): Promise<void> {
  console.log('✅ Validando migración...')
  
  try {
    // Verificar que el schema tiene Decimal
    const schema = await fs.readFile('prisma/schema.prisma', 'utf-8')
    const hasDecimal = schema.includes('Decimal') && schema.includes('@db.Decimal')
    
    if (!hasDecimal) {
      throw new Error('El schema no contiene definiciones Decimal')
    }
    
    console.log('   ✅ Schema validado correctamente')
  } catch (error) {
    console.error('❌ Error validando migración:', error)
    throw error
  }
}

async function runPriceMigration(): Promise<void> {
  console.log('💰 Ejecutando migración de precios...')
  
  try {
    execSync('npx tsx scripts/migrate-prices-to-decimal.ts', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    console.log('   ✅ Migración de precios completada')
  } catch (error) {
    console.error('❌ Error en migración de precios:', error)
    throw error
  }
}

async function createRollbackScript(): Promise<void> {
  console.log('🔄 Creando script de rollback...')
  
  const rollbackScript = `#!/usr/bin/env tsx

/**
 * Script de rollback para revertir la migración Decimal
 * Solo usar en caso de problemas críticos
 */

import { execSync } from 'child_process'
import { promises as fs } from 'fs'

async function rollback() {
  console.log('⚠️  INICIANDO ROLLBACK - Esto revertirá la migración Decimal')
  
  try {
    // 1. Restaurar schema original
    console.log('📄 Restaurando schema original...')
    const backupFiles = await fs.readdir('prisma')
    const schemaBackup = backupFiles.find(f => f.startsWith('schema-backup-'))
    
    if (schemaBackup) {
      const backupContent = await fs.readFile(\`prisma/\${schemaBackup}\`, 'utf-8')
      await fs.writeFile('prisma/schema.prisma', backupContent)
      console.log('   ✅ Schema restaurado')
    }
    
    // 2. Revertir migración
    console.log('🔄 Revirtiendo migración...')
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
    
    // 3. Regenerar cliente
    console.log('🔧 Regenerando cliente...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    console.log('✅ Rollback completado')
    
  } catch (error) {
    console.error('❌ Error en rollback:', error)
  }
}

rollback()
`
  
  await fs.writeFile('scripts/rollback-decimal-migration.ts', rollbackScript)
  console.log('   ✅ Script de rollback creado: scripts/rollback-decimal-migration.ts')
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando migración Float a Decimal')
  console.log('⚠️  IMPORTANTE: Esta migración es irreversible sin rollback')
  
  try {
    // 1. Crear backup
    await createSchemaBackup()
    
    // 2. Aplicar schema Decimal
    await applyDecimalSchema()
    
    // 3. Generar migración
    await generateMigration()
    
    // 4. Generar cliente
    await generateClient()
    
    // 5. Validar migración
    await validateMigration()
    
    // 6. Migrar precios existentes
    await runPriceMigration()
    
    // 7. Crear script de rollback
    await createRollbackScript()
    
    console.log('\n🎉 ¡Migración completada exitosamente!')
    console.log('\n📋 Próximos pasos:')
    console.log('   1. Probar la aplicación para verificar que todo funciona')
    console.log('   2. Verificar cálculos de precios y totales')
    console.log('   3. Probar operaciones de pago')
    console.log('   4. Si hay problemas, usar: npx tsx scripts/rollback-decimal-migration.ts')
    
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    console.log('\n🔄 Para revertir, ejecuta: npx tsx scripts/rollback-decimal-migration.ts')
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

export { 
  createSchemaBackup, 
  applyDecimalSchema, 
  generateMigration, 
  generateClient,
  validateMigration,
  runPriceMigration,
  createRollbackScript
}
