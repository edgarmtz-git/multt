#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixGoogleMapsAuth() {
  console.log('🔧 Solucionando problema de autenticación con Google Maps...\n')

  try {
    // 1. Crear usuario de prueba si no existe
    console.log('1. Verificando usuario de prueba...')
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@googlemaps.com' }
    })
    
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('test123', 10)
      testUser = await prisma.user.create({
        data: {
          name: 'Google Maps Test User',
          email: 'test@googlemaps.com',
          password: hashedPassword,
          role: 'CLIENT',
          isActive: true,
          company: 'Google Maps Test Company'
        }
      })
      console.log('✅ Usuario de prueba creado')
    } else {
      console.log('✅ Usuario de prueba ya existe')
    }

    // 2. Crear configuración de tienda
    console.log('\n2. Verificando configuración de tienda...')
    let storeSettings = await prisma.storeSettings.findFirst({
      where: { userId: testUser.id }
    })
    
    if (!storeSettings) {
      storeSettings = await prisma.storeSettings.create({
        data: {
          userId: testUser.id,
          storeName: 'Google Maps Test Store',
          storeSlug: 'google-maps-test-store',
          country: 'Mexico',
          language: 'es',
          currency: 'MXN',
          distanceUnit: 'km',
          mapProvider: 'GOOGLE',
          googleMapsApiKey: 'AIzaSyAR95HjXMWUpAZ7PqquoMzBN9Of6EJ4dA4',
          taxRate: 0.0,
          taxMethod: 'included',
          enableBusinessHours: false,
          disableCheckoutOutsideHours: false,
          deliveryEnabled: false,
          useBasePrice: false,
          baseDeliveryPrice: 0,
          baseDeliveryThreshold: 0,
          paymentsEnabled: true,
          storeActive: true,
          passwordProtected: false
        }
      })
      console.log('✅ Configuración de tienda creada')
    } else {
      // Actualizar configuración existente
      storeSettings = await prisma.storeSettings.update({
        where: { id: storeSettings.id },
        data: {
          mapProvider: 'GOOGLE',
          googleMapsApiKey: 'AIzaSyAR95HjXMWUpAZ7PqquoMzBN9Of6EJ4dA4'
        }
      })
      console.log('✅ Configuración de tienda actualizada')
    }

    console.log('\n🎉 ¡Configuración completada!')
    console.log('\n📋 Para probar Google Maps:')
    console.log('1. Ve a: http://localhost:3001/login')
    console.log('2. Inicia sesión con:')
    console.log('   - Email: test@googlemaps.com')
    console.log('   - Contraseña: test123')
    console.log('3. Ve a: http://localhost:3001/dashboard/settings')
    console.log('4. En "Perfil" → "Dirección" → "Agregar dirección"')
    console.log('5. ¡Deberías ver el mapa de Google Maps interactivo!')

    console.log('\n🗺️ Funcionalidades disponibles:')
    console.log('✅ Mapa interactivo de Google Maps')
    console.log('✅ Marcador arrastrable')
    console.log('✅ Clic en el mapa para seleccionar ubicación')
    console.log('✅ Geocodificación automática')
    console.log('✅ Coordenadas en tiempo real')
    console.log('✅ Controles de zoom y navegación')

    console.log('\n🔍 Verificación adicional:')
    console.log('Si el mapa no carga, verifica:')
    console.log('1. Que el servidor esté funcionando: npm run dev')
    console.log('2. Que hayas iniciado sesión correctamente')
    console.log('3. Que la API Key esté configurada en la base de datos')
    console.log('4. Revisa la consola del navegador para errores')

  } catch (error) {
    console.error('❌ Error en la configuración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixGoogleMapsAuth()
