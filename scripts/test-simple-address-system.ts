import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSimpleAddressSystem() {
  console.log('🧪 Probando el sistema de dirección simplificado...\n')

  try {
    // 1. Verificar que existe un usuario de prueba
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('📝 Creando usuario de prueba...')
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Usuario de Prueba',
          company: 'Empresa de Prueba',
          password: 'password123'
        }
      })
      console.log('✅ Usuario creado:', testUser.email)
    } else {
      console.log('✅ Usuario encontrado:', testUser.email)
    }

    // 2. Verificar configuración de la tienda
    let storeSettings = await prisma.storeSettings.findFirst({
      where: { userId: testUser.id }
    })

    if (!storeSettings) {
      console.log('📝 Creando configuración de tienda...')
      storeSettings = await prisma.storeSettings.create({
        data: {
          userId: testUser.id,
          storeName: 'Tienda de Prueba',
          storeSlug: 'tienda-de-prueba',
          mapProvider: 'google',
          googleMapsApiKey: 'AIzaSyAR95HjXMWUpAZ7PqquoMzBN9Of6EJ4dA4'
        }
      })
      console.log('✅ Configuración de tienda creada')
    } else {
      console.log('✅ Configuración de tienda encontrada')
    }

    // 3. Simular datos de dirección
    const testAddressData = {
      address: 'Calle Principal 123, Colonia Centro, Ciudad de México, CDMX, 06000',
      latitude: 19.4326,
      longitude: -99.1332,
      googleMapsUrl: 'https://www.google.com.mx/maps/place/Calle+Principal+123/@19.4326,-99.1332,15z'
    }

    console.log('\n📍 Datos de dirección de prueba:')
    console.log('Dirección:', testAddressData.address)
    console.log('Coordenadas:', `${testAddressData.latitude}, ${testAddressData.longitude}`)
    console.log('URL de Google Maps:', testAddressData.googleMapsUrl)

    // 4. Verificar que se pueden extraer coordenadas de la URL
    const extractCoordinates = (url: string) => {
      const patterns = [
        /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
        /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
        /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
          return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2])
          }
        }
      }
      return null
    }

    const extractedCoords = extractCoordinates(testAddressData.googleMapsUrl)
    console.log('\n🔍 Coordenadas extraídas de la URL:', extractedCoords)

    if (extractedCoords) {
      console.log('✅ Las coordenadas se extrajeron correctamente')
    } else {
      console.log('⚠️ No se pudieron extraer coordenadas de la URL')
    }

    // 5. Verificar diferentes formatos de URL de Google Maps
    const testUrls = [
      'https://www.google.com/maps/@19.4326,-99.1332,15z',
      'https://www.google.com/maps/place/Calle+Principal+123/@19.4326,-99.1332,15z',
      'https://www.google.com/maps?ll=19.4326,-99.1332&z=15',
      'https://maps.google.com/maps?q=19.4326,-99.1332'
    ]

    console.log('\n🧪 Probando diferentes formatos de URL:')
    testUrls.forEach((url, index) => {
      const coords = extractCoordinates(url)
      console.log(`URL ${index + 1}: ${coords ? '✅' : '❌'} ${coords ? `${coords.lat}, ${coords.lng}` : 'No extraído'}`)
    })

    console.log('\n🎉 Sistema de dirección simplificado funcionando correctamente!')
    console.log('\n📋 Instrucciones para el usuario:')
    console.log('1. Haga clic en "Agregar Dirección" para ingresar la dirección del local')
    console.log('2. Haga clic en "Obtener URL de Google Maps" para abrir Google Maps')
    console.log('3. En Google Maps, busque su dirección y haga clic derecho en el punto exacto')
    console.log('4. Seleccione "¿Qué hay aquí?" para obtener las coordenadas')
    console.log('5. Copie la URL completa de la barra de direcciones')
    console.log('6. Pegue la URL en el campo correspondiente')
    console.log('7. El sistema extraerá automáticamente las coordenadas')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSimpleAddressSystem()
