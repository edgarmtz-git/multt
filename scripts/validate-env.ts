#!/usr/bin/env tsx

/**
 * Script de validación de variables de entorno
 * Verifica que todas las variables críticas estén configuradas
 */

interface EnvVar {
  name: string
  required: boolean
  description: string
  example?: string
}

const REQUIRED_VARS: EnvVar[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'URL de conexión a la base de datos PostgreSQL',
    example: 'postgresql://user:password@localhost:5432/dbname'
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'Secreto para firmar JWT de NextAuth',
    example: 'generate-with: openssl rand -base64 32'
  },
  {
    name: 'NEXTAUTH_URL',
    required: true,
    description: 'URL base de la aplicación',
    example: 'https://yourdomain.com'
  },
  {
    name: 'NEXT_PUBLIC_ROOT_DOMAIN',
    required: true,
    description: 'Dominio raíz para subdomains',
    example: 'yourdomain.com'
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'URL pública de la aplicación',
    example: 'https://yourdomain.com'
  }
]

const OPTIONAL_VARS: EnvVar[] = [
  {
    name: 'GOOGLE_MAPS_API_KEY',
    required: false,
    description: 'API Key de Google Maps (servidor)',
    example: 'AIzaSy...'
  },
  {
    name: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
    required: false,
    description: 'API Key de Google Maps (cliente)',
    example: 'AIzaSy...'
  },
  {
    name: 'KV_REST_API_URL',
    required: false,
    description: 'URL de Redis para rate limiting',
    example: 'https://...'
  },
  {
    name: 'KV_REST_API_TOKEN',
    required: false,
    description: 'Token de Redis para rate limiting',
    example: '...'
  },
  {
    name: 'BLOB_READ_WRITE_TOKEN',
    required: false,
    description: 'Token de Vercel Blob Storage',
    example: 'vercel_blob_...'
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'API Key de Resend para emails',
    example: 're_...'
  },
  {
    name: 'SENTRY_DSN',
    required: false,
    description: 'DSN de Sentry para error tracking',
    example: 'https://...'
  }
]

function validateEnvironment() {
  console.log('🔍 Validando variables de entorno...\n')
  
  let hasErrors = false
  let hasWarnings = false
  
  // Validar variables requeridas
  console.log('📋 Variables requeridas:')
  for (const envVar of REQUIRED_VARS) {
    const value = process.env[envVar.name]
    if (!value) {
      console.log(`❌ ${envVar.name}: NO CONFIGURADA`)
      console.log(`   ${envVar.description}`)
      if (envVar.example) {
        console.log(`   Ejemplo: ${envVar.example}`)
      }
      hasErrors = true
    } else {
      console.log(`✅ ${envVar.name}: Configurada`)
    }
  }
  
  console.log('\n📋 Variables opcionales:')
  for (const envVar of OPTIONAL_VARS) {
    const value = process.env[envVar.name]
    if (!value) {
      console.log(`⚠️  ${envVar.name}: No configurada (opcional)`)
      console.log(`   ${envVar.description}`)
      hasWarnings = true
    } else {
      console.log(`✅ ${envVar.name}: Configurada`)
    }
  }
  
  // Validaciones específicas
  console.log('\n🔧 Validaciones específicas:')
  
  // Validar NEXTAUTH_SECRET en producción
  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.log('❌ NEXTAUTH_SECRET es obligatoria en producción')
      hasErrors = true
    } else if (secret === 'fallback-secret-for-development') {
      console.log('❌ NEXTAUTH_SECRET no puede usar el valor de fallback en producción')
      hasErrors = true
    } else if (secret.length < 32) {
      console.log('⚠️  NEXTAUTH_SECRET debería tener al menos 32 caracteres')
      hasWarnings = true
    } else {
      console.log('✅ NEXTAUTH_SECRET válida para producción')
    }
  }
  
  // Validar URLs
  const nextAuthUrl = process.env.NEXTAUTH_URL
  if (nextAuthUrl && !nextAuthUrl.startsWith('http')) {
    console.log('❌ NEXTAUTH_URL debe ser una URL completa (http:// o https://)')
    hasErrors = true
  }
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl && !appUrl.startsWith('http')) {
    console.log('❌ NEXT_PUBLIC_APP_URL debe ser una URL completa (http:// o https://)')
    hasErrors = true
  }
  
  // Resumen
  console.log('\n📊 Resumen:')
  if (hasErrors) {
    console.log('❌ Se encontraron errores críticos. La aplicación no funcionará correctamente.')
    console.log('💡 Revisa el archivo .env.example para ver todas las variables requeridas.')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️  Se encontraron advertencias. Algunas funcionalidades pueden no estar disponibles.')
    console.log('💡 Considera configurar las variables opcionales para funcionalidad completa.')
  } else {
    console.log('✅ Todas las variables están configuradas correctamente.')
  }
  
  console.log('\n🚀 La aplicación está lista para ejecutarse.')
}

// Ejecutar validación
validateEnvironment()
