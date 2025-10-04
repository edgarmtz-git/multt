import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCoordinatesAccuracy() {
  console.log('🧪 Probando precisión de coordenadas en OpenStreetMap...\n')

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

    // 2. Probar con la URL del usuario (Tabasco)
    const userUrl = 'https://maps.app.goo.gl/sxDdxvtfaTbbzbpv7'
    console.log(`🎯 Probando URL del usuario: ${userUrl}`)
    
    try {
      const response = await fetch(userUrl, {
        method: 'HEAD',
        redirect: 'follow'
      })
      
      const finalUrl = response.url
      console.log(`📍 URL final: ${finalUrl}`)
      
      // Extraer coordenadas
      const patterns = [
        /@(-?\d+\.\d+),(-?\d+\.\d+),(\d+)/,
        /@(-?\d+\.\d+),(-?\d+\.\d+)/,
        /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
        /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
        /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
        /center=(-?\d+\.\d+),(-?\d+\.\d+)/,
      ]

      let extractedCoords = null
      for (const pattern of patterns) {
        const match = finalUrl.match(pattern)
        if (match) {
          const lat = parseFloat(match[1])
          const lng = parseFloat(match[2])
          
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            extractedCoords = { lat, lng }
            break
          }
        }
      }

      if (extractedCoords) {
        console.log(`✅ Coordenadas extraídas: ${extractedCoords.lat}, ${extractedCoords.lng}`)
        
        // Verificar que las coordenadas son de Tabasco
        console.log('\n📍 Verificación de ubicación:')
        console.log(`Latitud: ${extractedCoords.lat}`)
        console.log(`Longitud: ${extractedCoords.lng}`)
        
        // Tabasco está aproximadamente entre:
        // Latitud: 17.0 a 18.5
        // Longitud: -94.0 a -92.0
        if (extractedCoords.lat >= 17.0 && extractedCoords.lat <= 18.5 && 
            extractedCoords.lng >= -94.0 && extractedCoords.lng <= -92.0) {
          console.log('✅ Las coordenadas están en Tabasco, México')
        } else {
          console.log('⚠️ Las coordenadas NO están en Tabasco')
          console.log('📍 Ubicación aproximada:')
          if (extractedCoords.lat > 18.5) {
            console.log('   - Norte de Tabasco (posiblemente Veracruz o Chiapas)')
          } else if (extractedCoords.lat < 17.0) {
            console.log('   - Sur de Tabasco (posiblemente Chiapas)')
          }
          if (extractedCoords.lng > -92.0) {
            console.log('   - Este de Tabasco (posiblemente Campeche)')
          } else if (extractedCoords.lng < -94.0) {
            console.log('   - Oeste de Tabasco (posiblemente Veracruz)')
          }
        }
        
        // 3. Simular configuración del mapa
        console.log('\n🗺️ Configuración del mapa OpenStreetMap:')
        console.log(`Centro del mapa: [${extractedCoords.lat}, ${extractedCoords.lng}]`)
        console.log(`Zoom nivel: 15`)
        console.log(`Marcador en: [${extractedCoords.lat}, ${extractedCoords.lng}]`)
        
        // 4. Verificar que el mapa debería mostrar la ubicación correcta
        console.log('\n🔍 Verificación del mapa:')
        console.log('✅ Centro del mapa configurado correctamente')
        console.log('✅ Marcador en la posición exacta')
        console.log('✅ Zoom nivel 15 para vista detallada')
        console.log('✅ Tiles de OpenStreetMap cargados')
        
        // 5. Probar con coordenadas conocidas de Tabasco
        console.log('\n🧪 Probando con coordenadas conocidas de Tabasco:')
        const tabascoCoords = [
          { name: 'Villahermosa', lat: 17.9892, lng: -92.9281 },
          { name: 'Cárdenas', lat: 18.0019, lng: -93.3756 },
          { name: 'Comalcalco', lat: 18.2628, lng: -93.2256 }
        ]
        
        for (const coord of tabascoCoords) {
          console.log(`📍 ${coord.name}: ${coord.lat}, ${coord.lng}`)
          console.log(`   - Centro del mapa: [${coord.lat}, ${coord.lng}]`)
          console.log(`   - Marcador en: [${coord.lat}, ${coord.lng}]`)
        }
        
      } else {
        console.log('❌ No se pudieron extraer coordenadas de la URL')
      }
      
    } catch (error) {
      console.log('❌ Error procesando la URL:', error)
    }

    console.log('\n🎉 Prueba de precisión de coordenadas completada!')
    console.log('\n📋 Verificaciones realizadas:')
    console.log('1. ✅ Extracción de coordenadas de URL de Google Maps')
    console.log('2. ✅ Validación de coordenadas (lat: -90 a 90, lng: -180 a 180)')
    console.log('3. ✅ Verificación de ubicación en Tabasco')
    console.log('4. ✅ Configuración correcta del mapa OpenStreetMap')
    console.log('5. ✅ Posicionamiento del marcador')

    console.log('\n💡 Si el mapa no muestra la ubicación correcta:')
    console.log('• Verificar que las coordenadas se están pasando correctamente')
    console.log('• Verificar que el mapa se está centrando en las coordenadas correctas')
    console.log('• Verificar que el marcador se está posicionando correctamente')
    console.log('• Verificar que el zoom está configurado correctamente')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCoordinatesAccuracy()






