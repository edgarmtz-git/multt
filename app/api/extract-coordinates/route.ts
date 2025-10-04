import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('🔍 Procesando URL:', url)

    // Para URLs cortas, expandir primero
    let finalUrl = url
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow'
        })
        finalUrl = response.url
        console.log('📍 URL expandida:', finalUrl)
      } catch (error) {
        console.error('Error expanding URL:', error)
        return NextResponse.json({
          success: false,
          error: 'No se pudo expandir la URL corta'
        })
      }
    }

    // Patrones para extraer coordenadas
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+),(\d+)/, // @lat,lng,zoom
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng
      /center=(-?\d+\.\d+),(-?\d+\.\d+)/, // center=lat,lng
      /search\/([+-]?\d+\.\d+),\+([+-]?\d+\.\d+)/, // search/lat,+lng
    ]

    for (const pattern of patterns) {
      const match = finalUrl.match(pattern)
      if (match) {
        const lat = parseFloat(match[1])
        const lng = parseFloat(match[2])
        
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.log('✅ Coordenadas extraídas:', lat, lng)
          return NextResponse.json({
            success: true,
            latitude: lat,
            longitude: lng,
            expandedUrl: finalUrl
          })
        }
      }
    }

    console.log('❌ No se pudieron extraer coordenadas de:', finalUrl)
    return NextResponse.json({
      success: false,
      error: 'No se pudieron extraer coordenadas de esta URL',
      expandedUrl: finalUrl
    })

  } catch (error) {
    console.error('Error extracting coordinates:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
