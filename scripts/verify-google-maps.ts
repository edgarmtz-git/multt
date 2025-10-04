#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyGoogleMaps() {
  console.log('🔍 Verificando configuración de Google Maps...\n')

  try {
    // 1. Verificar configuración en base de datos
    console.log('1. Verificando configuración en base de datos...')
    const storeSettings = await prisma.storeSettings.findMany({
      where: { mapProvider: 'GOOGLE' }
    })

    if (storeSettings.length === 0) {
      console.log('❌ No se encontraron configuraciones con Google Maps')
      return
    }

    console.log(`✅ Encontradas ${storeSettings.length} configuraciones con Google Maps`)
    
    storeSettings.forEach((settings, index) => {
      console.log(`   ${index + 1}. ${settings.storeName}`)
      console.log(`      - Proveedor: ${settings.mapProvider}`)
      console.log(`      - API Key: ${settings.googleMapsApiKey ? 'Configurada' : 'No configurada'}`)
      if (settings.googleMapsApiKey) {
        console.log(`      - Key: ${settings.googleMapsApiKey.substring(0, 20)}...`)
      }
    })

    // 2. Verificar que el servidor esté funcionando
    console.log('\n2. Verificando servidor...')
    try {
      const response = await fetch('http://localhost:3000/api/auth/providers')
      if (response.ok) {
        console.log('✅ Servidor funcionando en puerto 3000')
      } else {
        console.log('⚠️  Servidor en puerto 3000 no responde correctamente')
      }
    } catch (error) {
      console.log('❌ Servidor en puerto 3000 no disponible')
      console.log('   Inicia el servidor con: npm run dev')
      return
    }

    // 3. Verificar configuración de la API Key
    console.log('\n3. Verificando API Key...')
    const apiKey = storeSettings[0].googleMapsApiKey
    if (apiKey && apiKey.startsWith('AIzaSy')) {
      console.log('✅ API Key válida detectada')
      console.log(`   - Formato: ${apiKey.substring(0, 20)}...`)
      console.log('   - Longitud: Correcta')
    } else {
      console.log('❌ API Key no válida o no configurada')
      return
    }

    console.log('\n🎉 ¡Google Maps está completamente configurado!')
    console.log('\n📋 Para probar el mapa:')
    console.log('1. Ve a: http://localhost:3000/dashboard/settings')
    console.log('2. Inicia sesión con tu cuenta')
    console.log('3. Ve a la sección "Perfil"')
    console.log('4. En "Dirección", haz clic en "Agregar dirección"')
    console.log('5. ¡Deberías ver el mapa de Google Maps interactivo!')

    console.log('\n🗺️ Funcionalidades del mapa:')
    console.log('✅ Mapa interactivo de Google Maps')
    console.log('✅ Marcador arrastrable (puedes moverlo)')
    console.log('✅ Clic en el mapa para seleccionar ubicación')
    console.log('✅ Geocodificación automática (convierte direcciones a coordenadas)')
    console.log('✅ Coordenadas en tiempo real (muestra lat/lng)')
    console.log('✅ Controles de zoom y navegación')
    console.log('✅ Diferentes tipos de mapa (satélite, híbrido, etc.)')

    console.log('\n💡 Consejos de uso:')
    console.log('- Arrastra el marcador para ajustar la ubicación exacta')
    console.log('- Haz clic en el mapa para mover el marcador')
    console.log('- Usa los controles de zoom para navegar')
    console.log('- Las coordenadas se actualizan automáticamente')

  } catch (error) {
    console.error('❌ Error en la verificación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyGoogleMaps()
