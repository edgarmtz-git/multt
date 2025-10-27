#!/usr/bin/env tsx
/**
 * Script de validación PRE-PUSH
 * Ejecuta todas las validaciones antes de hacer push a producción
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ValidationResult {
  name: string
  success: boolean
  message: string
  duration: number
}

const results: ValidationResult[] = []

async function runValidation(
  name: string,
  command: string,
  description: string
): Promise<boolean> {
  console.log(`\n🔍 ${name}`)
  console.log(`   ${description}`)

  const startTime = Date.now()

  try {
    const { stdout, stderr } = await execAsync(command)
    const duration = Date.now() - startTime

    if (stderr && !stderr.includes('Warning')) {
      console.log(`   ❌ Falló (${duration}ms)`)
      results.push({ name, success: false, message: stderr, duration })
      return false
    }

    console.log(`   ✅ Pasó (${duration}ms)`)
    results.push({ name, success: true, message: stdout, duration })
    return true

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.log(`   ❌ Falló (${duration}ms)`)
    results.push({
      name,
      success: false,
      message: error.message || String(error),
      duration
    })
    return false
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║  🚀 VALIDACIÓN PRE-PUSH A PRODUCCIÓN                     ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')

  const validations = [
    {
      name: 'TypeScript',
      command: 'pnpm tsc --noEmit',
      description: 'Verificando errores de tipos TypeScript...'
    },
    {
      name: 'Prisma Client',
      command: 'pnpm prisma generate',
      description: 'Generando cliente de Prisma...'
    },
    {
      name: 'Prisma Schema',
      command: 'pnpm prisma validate',
      description: 'Validando schema de Prisma...'
    },
    {
      name: 'Next.js Build',
      command: 'pnpm next build',
      description: 'Construyendo aplicación Next.js...'
    },
    {
      name: 'Variables de Entorno',
      command: 'tsx scripts/verify-production-config.ts',
      description: 'Verificando variables de entorno requeridas...'
    }
  ]

  let allPassed = true

  for (const validation of validations) {
    const passed = await runValidation(
      validation.name,
      validation.command,
      validation.description
    )

    if (!passed) {
      allPassed = false
      // Continuar con todas las validaciones para ver todos los errores
    }
  }

  // Resumen
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║  📊 RESUMEN DE VALIDACIONES                               ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0)

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌'
    const time = `${result.duration}ms`
    console.log(`${icon} ${result.name.padEnd(30)} ${time}`)
  })

  console.log(`\nTotal: ${passed} pasaron, ${failed} fallaron (${totalTime}ms)`)

  if (!allPassed) {
    console.log('\n❌ PUSH BLOQUEADO - Hay errores que deben corregirse')
    console.log('\nDetalles de errores:')

    results
      .filter(r => !r.success)
      .forEach(result => {
        console.log(`\n🔴 ${result.name}:`)
        console.log(result.message.slice(0, 500))
      })

    process.exit(1)
  }

  console.log('\n✅ TODAS LAS VALIDACIONES PASARON')
  console.log('✅ Es seguro hacer push a producción')
  process.exit(0)
}

main()
