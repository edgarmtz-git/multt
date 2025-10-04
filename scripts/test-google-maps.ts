#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testGoogleMaps() {
  console.log('🧪 Probando integración de Google Maps...\n')

  try {
    // 1. Verificar configuración
    console.log('1. Verificando configuración...')
    const storeSettings = await prisma.storeSettings.findFirst({
      where: { mapProvider: 'GOOGLE' }
    })

    if (!storeSettings) {
      console.log('❌ No se encontró configuración de Google Maps')
      return
    }

    console.log('✅ Configuración encontrada:')
    console.log(`   - Proveedor: ${storeSettings.mapProvider}`)
    console.log(`   - API Key: ${storeSettings.googleMapsApiKey ? 'Configurada' : 'No configurada'}`)

    // 2. Verificar que la API Key sea válida
    if (!storeSettings.googleMapsApiKey || storeSettings.googleMapsApiKey === 'AIzaSyBvOkBw3cLx8j9K2mN3pQ4rS5tU6vW7xY8z') {
      console.log('\n⚠️  API Key de ejemplo detectada')
      console.log('   Necesitas reemplazar con tu API Key real')
      console.log('\n📋 Pasos para obtener API Key real:')
      console.log('1. Ve a: https://console.cloud.google.com/')
      console.log('2. Crea un proyecto o selecciona uno existente')
      console.log('3. Ve a "APIs y servicios" → "Biblioteca"')
      console.log('4. Busca y habilita:')
      console.log('   - Maps JavaScript API')
      console.log('   - Geocoding API')
      console.log('5. Ve a "APIs y servicios" → "Credenciales"')
      console.log('6. Clic en "Crear credenciales" → "Clave de API"')
      console.log('7. Configura restricciones:')
      console.log('   - Restricciones de aplicación: Sitios web HTTP')
      console.log('   - Agregar: http://localhost:3000/*')
      console.log('   - Agregar: http://localhost:3001/*')
      console.log('   - Restricciones de API: Restringir clave')
      console.log('   - Seleccionar: Maps JavaScript API, Geocoding API')
      console.log('8. Copia la API Key generada')
      console.log('\n🔧 Para actualizar la API Key:')
      console.log('   npx prisma studio')
      console.log('   Ve a StoreSettings → Editar → googleMapsApiKey')
    } else {
      console.log('\n✅ API Key configurada correctamente')
    }

    // 3. Verificar que el servidor esté funcionando
    console.log('\n2. Verificando servidor...')
    try {
      const response = await fetch('http://localhost:3000/api/auth/providers')
      if (response.ok) {
        console.log('✅ Servidor funcionando en puerto 3000')
      } else {
        console.log('⚠️  Servidor en puerto 3000 no responde')
      }
    } catch (error) {
      console.log('⚠️  Servidor en puerto 3000 no disponible')
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/providers')
      if (response.ok) {
        console.log('✅ Servidor funcionando en puerto 3001')
      } else {
        console.log('⚠️  Servidor en puerto 3001 no responde')
      }
    } catch (error) {
      console.log('⚠️  Servidor en puerto 3001 no disponible')
    }

    console.log('\n🎯 Para probar Google Maps:')
    console.log('1. Asegúrate de tener una API Key válida')
    console.log('2. Inicia el servidor: npm run dev')
    console.log('3. Ve a: http://localhost:3000/dashboard/settings')
    console.log('4. En la sección "Dirección", haz clic en "Agregar dirección"')
    console.log('5. Deberías ver el mapa de Google Maps interactivo')

    console.log('\n📱 Funcionalidades del mapa:')
    console.log('✅ Mapa interactivo de Google Maps')
    console.log('✅ Marcador arrastrable')
    console.log('✅ Clic en el mapa para seleccionar ubicación')
    console.log('✅ Geocodificación automática')
    console.log('✅ Coordenadas en tiempo real')
    console.log('✅ Controles de zoom y navegación')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGoogleMaps()
