#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugGoogleMaps() {
  console.log('🔍 Debugging Google Maps configuration...\n')

  try {
    // 1. Verificar configuración en base de datos
    console.log('1. Verificando configuración en base de datos...')
    const allSettings = await prisma.storeSettings.findMany()
    
    console.log(`📊 Total de configuraciones: ${allSettings.length}`)
    
    allSettings.forEach((settings, index) => {
      console.log(`\n${index + 1}. ${settings.storeName}:`)
      console.log(`   - ID: ${settings.id}`)
      console.log(`   - User ID: ${settings.userId}`)
      console.log(`   - Map Provider: ${settings.mapProvider}`)
      console.log(`   - Google Maps API Key: ${settings.googleMapsApiKey ? 'Configurada' : 'No configurada'}`)
      if (settings.googleMapsApiKey) {
        console.log(`   - API Key: ${settings.googleMapsApiKey.substring(0, 20)}...`)
      }
    })

    // 2. Verificar endpoint de configuración
    console.log('\n2. Verificando endpoint de configuración...')
    try {
      const response = await fetch('http://localhost:3001/api/dashboard/settings')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Endpoint funcionando')
        console.log(`   - Map Provider: ${data.mapProvider}`)
        console.log(`   - Google Maps API Key: ${data.googleMapsApiKey ? 'Configurada' : 'No configurada'}`)
        if (data.googleMapsApiKey) {
          console.log(`   - API Key: ${data.googleMapsApiKey.substring(0, 20)}...`)
        }
      } else {
        console.log('❌ Endpoint no responde correctamente')
        console.log(`   Status: ${response.status}`)
      }
    } catch (error) {
      console.log('❌ Error accediendo al endpoint:', error)
    }

    // 3. Verificar que el usuario tenga sesión
    console.log('\n3. Verificando autenticación...')
    try {
      const response = await fetch('http://localhost:3001/api/auth/session')
      if (response.ok) {
        const session = await response.json()
        console.log('✅ Sesión activa')
        console.log(`   - User: ${session.user?.email}`)
        console.log(`   - Role: ${session.user?.role}`)
      } else {
        console.log('⚠️  No hay sesión activa')
        console.log('   Necesitas iniciar sesión en http://localhost:3001/login')
      }
    } catch (error) {
      console.log('❌ Error verificando sesión:', error)
    }

    console.log('\n💡 Soluciones posibles:')
    console.log('1. Inicia sesión en: http://localhost:3001/login')
    console.log('2. Ve a: http://localhost:3001/dashboard/settings')
    console.log('3. En "Perfil" → "Dirección" → "Agregar dirección"')
    console.log('4. El mapa debería cargar con la API Key configurada')

  } catch (error) {
    console.error('❌ Error en el debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugGoogleMaps()
