#!/usr/bin/env tsx
/**
 * Script para verificar que todas las variables de entorno críticas
 * estén configuradas antes del deploy a producción
 */

const requiredEnvVars = {
  CRITICAL: [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
  ],
  RECOMMENDED: [
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
  ],
  OPTIONAL: [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_ROOT_DOMAIN',
    'GOOGLE_MAPS_API_KEY',
    'BLOB_READ_WRITE_TOKEN',
  ]
}

interface CheckResult {
  name: string
  configured: boolean
  value?: string
  issue?: string
}

function checkEnvVar(name: string): CheckResult {
  const value = process.env[name]

  if (!value) {
    return {
      name,
      configured: false,
      issue: 'No configurada'
    }
  }

  // Validaciones específicas
  const issues: string[] = []

  if (name === 'NEXTAUTH_SECRET') {
    if (value.length < 32) {
      issues.push('Muy corto (mínimo 32 caracteres)')
    }
    if (value === 'fallback-secret-key-for-development') {
      issues.push('⚠️ CRÍTICO: Usando secret de desarrollo!')
    }
    if (value.includes('CHANGE-ME') || value.includes('your-secret')) {
      issues.push('⚠️ CRÍTICO: Secret no ha sido cambiado del ejemplo')
    }
  }

  if (name === 'DATABASE_URL') {
    if (value.includes('file:')) {
      issues.push('⚠️ CRÍTICO: Usando SQLite (no apto para producción)')
    }
    if (!value.includes('postgresql://') && !value.includes('postgres://')) {
      issues.push('Debe ser PostgreSQL en producción')
    }
  }

  if (name === 'NEXTAUTH_URL') {
    if (value.includes('localhost')) {
      issues.push('⚠️ Usando localhost (cambiar a dominio de producción)')
    }
    if (!value.startsWith('https://') && process.env.NODE_ENV === 'production') {
      issues.push('Debe usar HTTPS en producción')
    }
  }

  if (name === 'RESEND_API_KEY') {
    if (!value.startsWith('re_')) {
      issues.push('API key inválida (debe empezar con re_)')
    }
  }

  return {
    name,
    configured: true,
    value: name.includes('SECRET') || name.includes('TOKEN') || name.includes('KEY')
      ? `${value.substring(0, 8)}...`
      : value,
    issue: issues.length > 0 ? issues.join(', ') : undefined
  }
}

function printResults() {
  console.log('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN DE PRODUCCIÓN\n')
  console.log('═══════════════════════════════════════════════\n')

  let hasErrors = false
  let hasWarnings = false

  // CRÍTICAS
  console.log('🔴 VARIABLES CRÍTICAS (OBLIGATORIAS)\n')
  requiredEnvVars.CRITICAL.forEach(envVar => {
    const result = checkEnvVar(envVar)
    const status = result.configured ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
    if (result.value) {
      console.log(`   Valor: ${result.value}`)
    }
    if (result.issue) {
      console.log(`   ⚠️  ${result.issue}`)
      if (result.issue.includes('CRÍTICO')) {
        hasErrors = true
      } else {
        hasWarnings = true
      }
    }
    if (!result.configured) {
      hasErrors = true
    }
    console.log()
  })

  // RECOMENDADAS
  console.log('🟡 VARIABLES RECOMENDADAS (ALTA PRIORIDAD)\n')
  requiredEnvVars.RECOMMENDED.forEach(envVar => {
    const result = checkEnvVar(envVar)
    const status = result.configured ? '✅' : '⚠️ '
    console.log(`${status} ${result.name}`)
    if (result.value) {
      console.log(`   Valor: ${result.value}`)
    }
    if (result.issue) {
      console.log(`   ⚠️  ${result.issue}`)
      hasWarnings = true
    }
    if (!result.configured) {
      console.log(`   Nota: Funcionalidad limitada sin esta variable`)
      hasWarnings = true
    }
    console.log()
  })

  // OPCIONALES
  console.log('🔵 VARIABLES OPCIONALES\n')
  requiredEnvVars.OPTIONAL.forEach(envVar => {
    const result = checkEnvVar(envVar)
    const status = result.configured ? '✅' : 'ℹ️ '
    console.log(`${status} ${result.name}`)
    if (result.value) {
      console.log(`   Valor: ${result.value}`)
    }
    if (result.issue) {
      console.log(`   ⚠️  ${result.issue}`)
    }
    console.log()
  })

  // RESUMEN
  console.log('═══════════════════════════════════════════════\n')
  console.log('📊 RESUMEN\n')

  if (hasErrors) {
    console.log('❌ ERRORES CRÍTICOS ENCONTRADOS')
    console.log('   ⛔ NO DESPLEGAR A PRODUCCIÓN hasta corregir\n')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️  ADVERTENCIAS ENCONTRADAS')
    console.log('   Se puede desplegar, pero se recomienda revisar\n')
    process.exit(0)
  } else {
    console.log('✅ CONFIGURACIÓN COMPLETA Y CORRECTA')
    console.log('   Listo para desplegar a producción\n')
    process.exit(0)
  }
}

// Información adicional
console.log('\n📋 Información del Sistema\n')
console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`Platform: ${process.platform}`)
console.log(`Node Version: ${process.version}`)

// Verificar Prisma
try {
  const { PrismaClient } = require('@prisma/client')
  console.log('Prisma Client: ✅ Disponible\n')
} catch (error) {
  console.log('Prisma Client: ❌ No generado (ejecuta: pnpm db:generate)\n')
}

printResults()
