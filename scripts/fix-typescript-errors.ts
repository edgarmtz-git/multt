#!/usr/bin/env tsx
/**
 * Script para corregir errores de TypeScript conocidos
 * Automatiza las correcciones repetitivas
 */

import { readFileSync, writeFileSync } from 'fs'

console.log('🔧 Corrigiendo errores de TypeScript...\n')

const fixes = [
  // Fix 1: Remove 'order' from global options orderBy
  {
    file: 'app/api/dashboard/global-options/route.ts',
    search: /orderBy:\s*\{\s*order:\s*['"]asc['"]\s*\}/g,
    replace: 'orderBy: { name: \'asc\' }',
    description: 'GlobalOption orderBy: order -> name'
  },

  // Fix 2: Remove 'availability' from GlobalOptionChoice includes
  {
    file: 'app/api/dashboard/global-options/[id]/availability/route.ts',
    search: /availability:\s*true/g,
    replace: '// availability field removed',
    description: 'Remove availability from includes'
  },

  // Fix 3: Change isAvailable to available in global option availability
  {
    file: 'app/api/dashboard/global-options/[id]/availability/route.ts',
    search: /isAvailable:/g,
    replace: 'available:',
    description: 'isAvailable -> available'
  },

  // Fix 4: Remove choiceId from GlobalOptionChoiceAvailability
  {
    file: 'app/api/dashboard/global-options/[id]/choices/[choiceId]/availability/route.ts',
    search: /choiceId:\s*choiceId,/g,
    replace: '// choiceId removed',
    description: 'Remove choiceId field'
  },

  // Fix 5: Change isAvailable to available in choice availability
  {
    file: 'app/api/dashboard/global-options/[id]/choices/[choiceId]/availability/route.ts',
    search: /isAvailable:/g,
    replace: 'available:',
    description: 'isAvailable -> available in choices'
  },

  // Fix 6: Remove maxSelections from ProductGlobalOption
  {
    file: 'app/api/dashboard/products/[id]/global-options/route.ts',
    search: /maxSelections:/g,
    replace: '// maxSelections removed -',
    description: 'Remove maxSelections field'
  },

  // Fix 7: Remove variant from OrderItem includes
  {
    file: 'app/api/orders/[id]/route.ts',
    search: /variant:\s*true,?/g,
    replace: '// variant removed',
    description: 'Remove variant from OrderItem'
  },

  // Fix 8: Remove variant from tracking route
  {
    file: 'app/api/tracking/[orderId]/route.ts',
    search: /variant:\s*true,?/g,
    replace: '// variant removed',
    description: 'Remove variant from tracking'
  },

  // Fix 9: Remove errorMessage from AuditLog
  {
    file: 'lib/audit-logger.ts',
    search: /errorMessage:/g,
    replace: '// errorMessage removed -',
    description: 'Remove errorMessage field'
  },

  // Fix 10: Remove mode from StringFilter
  {
    file: 'lib/query-optimizer.ts',
    search: /mode:\s*['"]insensitive['"]/g,
    replace: '// mode removed',
    description: 'Remove mode from filters'
  },

  // Fix 11: Change isRequired to required
  {
    file: 'lib/query-optimizer.ts',
    search: /isRequired:/g,
    replace: 'required:',
    description: 'isRequired -> required'
  },

  // Fix 12: Remove availability from tienda categories
  {
    file: 'app/api/tienda/[cliente]/categories/route.ts',
    search: /availability:\s*true/g,
    replace: '// availability removed',
    description: 'Remove availability from store categories'
  }
]

let fixedCount = 0
let errorCount = 0

for (const fix of fixes) {
  try {
    const filePath = `/home/frikilancer/multt/${fix.file}`
    let content = readFileSync(filePath, 'utf-8')

    const matches = content.match(fix.search)
    if (matches) {
      content = content.replace(fix.search, fix.replace)
      writeFileSync(filePath, content, 'utf-8')
      console.log(`✅ ${fix.description} (${matches.length} occurrences)`)
      fixedCount++
    } else {
      console.log(`ℹ️  ${fix.description} - No matches found (already fixed?)`)
    }
  } catch (error: any) {
    console.log(`❌ ${fix.description} - Error: ${error.message}`)
    errorCount++
  }
}

console.log(`\n📊 Resumen:`)
console.log(`   ✅ Correcciones aplicadas: ${fixedCount}`)
console.log(`   ❌ Errores: ${errorCount}`)
console.log(`\n🔍 Ejecuta 'pnpm validate:types' para verificar`)
