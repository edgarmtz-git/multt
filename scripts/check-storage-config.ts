#!/usr/bin/env tsx

/**
 * Script para verificar la configuración de storage
 * Útil para debugging en producción
 */

import { getStorageProvider } from '../lib/storage'

async function checkStorageConfig() {
  console.log('🔍 Verificando configuración de storage...\n')

  // Mostrar variables de entorno relevantes
  console.log('📋 Variables de entorno:')
  console.log(`  NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`  VERCEL: ${process.env.VERCEL}`)
  console.log(`  STORAGE_PROVIDER: ${process.env.STORAGE_PROVIDER || 'local (default)'}`)
  console.log(`  BLOB_READ_WRITE_TOKEN: ${process.env.BLOB_READ_WRITE_TOKEN ? '✅ Configurado' : '❌ No configurado'}`)
  console.log(`  S3_ACCESS_KEY_ID: ${process.env.S3_ACCESS_KEY_ID ? '✅ Configurado' : '❌ No configurado'}`)
  console.log(`  S3_SECRET_ACCESS_KEY: ${process.env.S3_SECRET_ACCESS_KEY ? '✅ Configurado' : '❌ No configurado'}`)
  console.log(`  NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || '❌ No configurado'}`)

  console.log('\n🔧 Inicializando storage provider...')

  try {
    const storage = await getStorageProvider()
    console.log('✅ Storage provider inicializado correctamente')
    console.log(`  Tipo: ${storage.constructor.name}`)

    // Test de upload con un archivo dummy
    console.log('\n🧪 Probando upload...')
    
    // Crear un archivo dummy para testing
    const dummyFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    try {
      const result = await storage.upload(dummyFile, 'test')
      console.log('✅ Upload exitoso:')
      console.log(`  URL: ${result.url}`)
      console.log(`  Key: ${result.key}`)
      console.log(`  Size: ${result.size} bytes`)
      console.log(`  Type: ${result.type}`)
    } catch (uploadError) {
      console.error('❌ Error en upload:', uploadError)
    }

  } catch (error) {
    console.error('❌ Error inicializando storage provider:', error)
  }

  console.log('\n📝 Recomendaciones:')
  
  if (process.env.VERCEL) {
    console.log('  🚀 Estás en Vercel - considera usar:')
    console.log('    1. Vercel Blob Storage (recomendado)')
    console.log('    2. AWS S3')
    console.log('    3. Cloudinary')
    console.log('  ⚠️  Local storage NO es persistente en Vercel')
  } else {
    console.log('  💻 Estás en desarrollo/local - local storage está bien')
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL) {
    console.log('\n🔧 Para configurar Vercel Blob:')
    console.log('  1. Ve a tu proyecto en Vercel Dashboard')
    console.log('  2. Settings → Environment Variables')
    console.log('  3. Agrega: BLOB_READ_WRITE_TOKEN')
    console.log('  4. Agrega: STORAGE_PROVIDER = "vercel-blob"')
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkStorageConfig().catch(console.error)
}

export { checkStorageConfig }
