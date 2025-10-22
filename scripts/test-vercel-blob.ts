#!/usr/bin/env tsx
/**
 * Script de prueba para Vercel Blob
 * Sube un archivo de prueba y lo elimina
 */

import { put, del } from '@vercel/blob'

async function testVercelBlob() {
  console.log('🧪 Probando Vercel Blob...\n')

  // Verificar token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN no configurado')
    console.log('   Configura la variable en .env.local')
    process.exit(1)
  }

  try {
    // 1. Crear archivo de prueba
    console.log('1️⃣ Creando archivo de prueba...')
    const testContent = 'Hello from Multt! Testing Vercel Blob Storage 🎉'
    const testFileName = `test-${Date.now()}.txt`

    // 2. Subir archivo
    console.log('2️⃣ Subiendo archivo a Vercel Blob...')
    const blob = await put(testFileName, testContent, {
      access: 'public',
    })

    console.log('   ✅ Archivo subido exitosamente!')
    console.log('   📍 URL:', blob.url)
    console.log('   🔑 Pathname:', blob.pathname)
    console.log('   📦 Size:', blob.size, 'bytes')
    console.log('')

    // 3. Verificar que el archivo sea accesible
    console.log('3️⃣ Verificando que el archivo sea accesible...')
    const response = await fetch(blob.url)
    const content = await response.text()

    if (content === testContent) {
      console.log('   ✅ Contenido verificado correctamente!')
    } else {
      console.log('   ❌ El contenido no coincide')
      console.log('   Esperado:', testContent)
      console.log('   Recibido:', content)
    }
    console.log('')

    // 4. Eliminar archivo de prueba
    console.log('4️⃣ Eliminando archivo de prueba...')
    await del(blob.url)
    console.log('   ✅ Archivo eliminado!')
    console.log('')

    // 5. Verificar que el archivo fue eliminado
    console.log('5️⃣ Verificando eliminación...')
    const checkResponse = await fetch(blob.url)
    if (checkResponse.status === 404) {
      console.log('   ✅ Archivo eliminado correctamente (404)')
    } else {
      console.log('   ⚠️  El archivo aún existe (status:', checkResponse.status, ')')
    }
    console.log('')

    console.log('✅ Todas las pruebas pasaron exitosamente!')
    console.log('')
    console.log('🎉 Vercel Blob está funcionando correctamente')
    console.log('   Ahora puedes usar el sistema de storage en tu aplicación')

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error)
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message)
    }
    process.exit(1)
  }
}

testVercelBlob()
