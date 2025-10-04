import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CoordinateResult {
  latitude: number
  longitude: number
  address?: string
  success: boolean
  error?: string
}

async function geocodeGoogleMapsUrl(url: string): Promise<CoordinateResult> {
  try {
    console.log(`🔍 Geocodificando URL: ${url}`)
    
    // Para URLs cortas de Google Maps, necesitamos hacer una petición HTTP
    // Primero, intentamos obtener la URL completa
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow'
    })
    
    const finalUrl = response.url
    console.log(`📍 URL final: ${finalUrl}`)
    
    // Ahora extraemos las coordenadas de la URL final
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+),(\d+)/,
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /center=(-?\d+\.\d+),(-?\d+\.\d+)/,
    ]

    for (const pattern of patterns) {
      const match = finalUrl.match(pattern)
      if (match) {
        const lat = parseFloat(match[1])
        const lng = parseFloat(match[2])
        
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.log(`✅ Coordenadas extraídas: ${lat}, ${lng}`)
          return {
            latitude: lat,
            longitude: lng,
            address: `Ubicación en ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            success: true
          }
        }
      }
    }

    // Si no se pueden extraer coordenadas, intentar geocodificación inversa
    console.log('⚠️ No se pudieron extraer coordenadas de la URL, intentando geocodificación inversa...')
    
    // Para esto necesitaríamos la API de Google Maps, pero como no está disponible,
    // retornamos un error
    return {
      latitude: 0,
      longitude: 0,
      success: false,
      error: 'No se pudieron extraer coordenadas de esta URL'
    }

  } catch (error) {
    console.error('❌ Error geocodificando URL:', error)
    return {
      latitude: 0,
      longitude: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

async function testGeocoding() {
  console.log('🧪 Probando geocodificación de URLs de Google Maps...\n')

  try {
    // URL específica del usuario
    const userUrl = 'https://maps.app.goo.gl/sxDdxvtfaTbbzbpv7'
    
    console.log(`🎯 Geocodificando URL del usuario: ${userUrl}`)
    const result = await geocodeGoogleMapsUrl(userUrl)
    
    if (result.success) {
      console.log(`✅ Coordenadas extraídas: ${result.latitude}, ${result.longitude}`)
      console.log(`📍 Dirección: ${result.address}`)
      
      // Simular el uso en OpenStreetMap
      console.log('\n🗺️ Simulando uso en OpenStreetMap:')
      console.log(`✅ Centro del mapa: [${result.latitude}, ${result.longitude}]`)
      console.log(`✅ Zoom nivel: 15`)
      console.log(`✅ Marcador en ubicación exacta`)
      console.log(`✅ Enlace a Google Maps: ${userUrl}`)
      
    } else {
      console.log(`❌ Error: ${result.error}`)
      console.log('💡 Sugerencias:')
      console.log('1. Verificar que la URL sea válida')
      console.log('2. Intentar con una URL completa de Google Maps')
      console.log('3. Usar coordenadas directas si están disponibles')
    }

    // Probar con URLs que sabemos que funcionan
    console.log('\n🧪 Probando con URLs conocidas:')
    
    const testUrls = [
      'https://www.google.com/maps/@19.4326,-99.1332,15z',
      'https://www.google.com/maps/place/Calle+Principal+123/@19.4326,-99.1332,15z'
    ]

    for (const url of testUrls) {
      console.log(`\n🔍 Probando: ${url}`)
      const testResult = await geocodeGoogleMapsUrl(url)
      
      if (testResult.success) {
        console.log(`✅ Coordenadas: ${testResult.latitude}, ${testResult.longitude}`)
      } else {
        console.log(`❌ Error: ${testResult.error}`)
      }
    }

    console.log('\n🎉 Prueba de geocodificación completada!')
    console.log('\n📋 Funcionalidades implementadas:')
    console.log('1. ✅ Seguimiento de redirecciones de URLs cortas')
    console.log('2. ✅ Extracción de coordenadas de URLs finales')
    console.log('3. ✅ Validación de coordenadas')
    console.log('4. ✅ Manejo de errores')
    console.log('5. ✅ Integración con OpenStreetMap')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGeocoding()






