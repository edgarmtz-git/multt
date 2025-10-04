#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateGoogleMapsKey() {
  console.log('🗺️ Actualizando API Key de Google Maps...\n')

  try {
    const apiKey = 'AIzaSyAR95HjXMWUpAZ7PqquoMzBN9Of6EJ4dA4'
    
    // Buscar todas las configuraciones de tienda
    const storeSettings = await prisma.storeSettings.findMany()
    
    if (storeSettings.length === 0) {
      console.log('❌ No se encontraron configuraciones de tienda')
      return
    }

    console.log(`📊 Encontradas ${storeSettings.length} configuraciones de tienda`)

    // Actualizar todas las configuraciones
    for (const settings of storeSettings) {
      const updated = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: {
          mapProvider: 'GOOGLE',
          googleMapsApiKey: apiKey
        }
      })

      console.log(`✅ Actualizada configuración: ${updated.storeName}`)
      console.log(`   - Proveedor: ${updated.mapProvider}`)
      console.log(`   - API Key: ${updated.googleMapsApiKey ? 'Configurada' : 'No configurada'}`)
    }

    console.log('\n🎉 ¡API Key de Google Maps configurada correctamente!')
    console.log('\n📋 Para probar:')
    console.log('1. Ve a: http://localhost:3000/dashboard/settings')
    console.log('2. Sección "Perfil" → "Dirección"')
    console.log('3. Clic en "Agregar dirección"')
    console.log('4. ¡Deberías ver el mapa de Google Maps interactivo!')

    console.log('\n🗺️ Funcionalidades disponibles:')
    console.log('✅ Mapa interactivo de Google Maps')
    console.log('✅ Marcador arrastrable')
    console.log('✅ Clic en el mapa para seleccionar ubicación')
    console.log('✅ Geocodificación automática')
    console.log('✅ Coordenadas en tiempo real')
    console.log('✅ Controles de zoom y navegación')

  } catch (error) {
    console.error('❌ Error actualizando API Key:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateGoogleMapsKey()
