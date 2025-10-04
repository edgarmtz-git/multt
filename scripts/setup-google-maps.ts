#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupGoogleMaps() {
  console.log('🗺️ Configurando Google Maps API...\n')

  try {
    // 1. Buscar usuario de prueba
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@delivery.com' }
    })

    if (!testUser) {
      console.log('❌ Usuario de prueba no encontrado')
      console.log('   Ejecuta primero: npx tsx scripts/test-delivery-zones.ts')
      return
    }

    // 2. Buscar configuración de tienda
    let storeSettings = await prisma.storeSettings.findFirst({
      where: { userId: testUser.id }
    })

    if (!storeSettings) {
      console.log('❌ Configuración de tienda no encontrada')
      return
    }

    // 3. Actualizar configuración para usar Google Maps
    const updatedSettings = await prisma.storeSettings.update({
      where: { id: storeSettings.id },
      data: {
        mapProvider: 'GOOGLE',
        googleMapsApiKey: 'AIzaSyBvOkBw3cLx8j9K2mN3pQ4rS5tU6vW7xY8z' // API Key de ejemplo
      }
    })

    console.log('✅ Configuración actualizada:')
    console.log(`   - Proveedor de mapas: ${updatedSettings.mapProvider}`)
    console.log(`   - API Key configurada: ${updatedSettings.googleMapsApiKey ? 'Sí' : 'No'}`)

    console.log('\n📋 Pasos para configurar Google Maps:')
    console.log('1. Ve a: https://console.cloud.google.com/')
    console.log('2. Crea un nuevo proyecto')
    console.log('3. Habilita estas APIs:')
    console.log('   - Maps JavaScript API')
    console.log('   - Geocoding API')
    console.log('   - Places API (opcional)')
    console.log('4. Crea una API Key')
    console.log('5. Configura restricciones:')
    console.log('   - Sitios web: http://localhost:3000/*, http://localhost:3001/*')
    console.log('   - APIs: Maps JavaScript API, Geocoding API')
    console.log('6. Copia la API Key y reemplaza en la base de datos')

    console.log('\n🔧 Para actualizar la API Key:')
    console.log('   npx prisma studio')
    console.log('   Ve a StoreSettings → Editar → googleMapsApiKey')

  } catch (error) {
    console.error('❌ Error configurando Google Maps:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupGoogleMaps()
