import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Función para calcular distancia entre dos puntos usando fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  return Math.round(distance * 100) / 100 // Redondear a 2 decimales
}

// POST - Calcular precio de envío
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { clientLat, clientLng, storeSlug } = body

    // Validar datos requeridos
    if (!clientLat || !clientLng) {
      return NextResponse.json(
        { error: 'Coordenadas del cliente son requeridas' },
        { status: 400 }
      )
    }

    // Buscar configuración de la tienda
    const storeSettings = await prisma.storeSettings.findFirst({
      where: storeSlug ? {
        storeSlug: storeSlug
      } : {
        user: {
          id: session.user.id
        }
      },
      include: {
        user: true
      }
    })

    if (!storeSettings) {
      return NextResponse.json(
        { error: 'Configuración de tienda no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la tienda tenga dirección configurada
    if (!storeSettings.address) {
      return NextResponse.json(
        { 
          error: 'La tienda no tiene dirección configurada',
          message: 'El propietario debe configurar la dirección de la tienda en el dashboard'
        },
        { status: 400 }
      )
    }

    // Parsear dirección de la tienda
    let storeAddress
    try {
      storeAddress = JSON.parse(storeSettings.address as string)
    } catch {
      return NextResponse.json(
        { error: 'Dirección de la tienda no válida' },
        { status: 400 }
      )
    }

    if (!storeAddress.latitude || !storeAddress.longitude) {
      return NextResponse.json(
        { 
          error: 'La tienda no tiene coordenadas válidas',
          message: 'El propietario debe configurar correctamente la dirección de la tienda'
        },
        { status: 400 }
      )
    }

    // Calcular distancia
    const distance = calculateDistance(
      storeAddress.latitude,
      storeAddress.longitude,
      clientLat,
      clientLng
    )

    console.log('🚚 Cálculo de envío:', {
      storeSlug: storeSettings.storeSlug,
      storeLocation: { lat: storeAddress.latitude, lng: storeAddress.longitude },
      clientLocation: { lat: clientLat, lng: clientLng },
      distance: `${distance} km`,
      method: storeSettings.deliveryCalculationMethod,
      allSettings: {
        deliveryCalculationMethod: storeSettings.deliveryCalculationMethod,
        pricePerKm: storeSettings.pricePerKm,
        maxDeliveryDistance: storeSettings.maxDeliveryDistance,
        baseDeliveryPrice: storeSettings.baseDeliveryPrice,
        manualDeliveryMessage: storeSettings.manualDeliveryMessage
      }
    })

    // Calcular precio según el método configurado
    let deliveryPrice = 0
    let message = ''
    let isWithinRange = true

    switch (storeSettings.deliveryCalculationMethod) {
      case 'distance':
        // Verificar distancia máxima
        const maxDistance = storeSettings.maxDeliveryDistance || 7
        if (distance > maxDistance) {
          isWithinRange = false
          message = `Lo sentimos, no realizamos entregas a más de ${maxDistance} km de distancia. Tu ubicación está a ${distance} km.`
        } else {
          const pricePerKm = storeSettings.pricePerKm || 0
          const minFee = storeSettings.minDeliveryFee || 0
          const calculatedPrice = Math.round(distance * pricePerKm * 100) / 100

          // Aplicar costo mínimo si el calculado es menor
          deliveryPrice = Math.max(calculatedPrice, minFee)

          if (deliveryPrice === minFee && calculatedPrice < minFee) {
            message = `Envío: $${deliveryPrice} (costo mínimo aplicado - distancia ${distance} km)`
          } else {
            message = `Envío calculado: ${distance} km × $${pricePerKm}/km = $${deliveryPrice}`
          }
        }
        break

      case 'zones':
        // Buscar zona de entrega (implementación básica por ahora)
        // TODO: Implementar lógica de zonas geográficas
        deliveryPrice = storeSettings.baseDeliveryPrice || 0
        message = `Envío por zona: $${deliveryPrice}`
        break

      case 'manual':
        deliveryPrice = 0
        message = storeSettings.manualDeliveryMessage || 'El costo de envío se calculará al confirmar el pedido y se te enviará por WhatsApp.'
        break

      default:
        // Fallback al método legacy
        deliveryPrice = storeSettings.baseDeliveryPrice || 0
        message = `Envío: $${deliveryPrice}`
    }

    const response = {
      success: true,
      distance,
      price: deliveryPrice,
      method: storeSettings.deliveryCalculationMethod,
      message,
      isWithinRange,
      storeLocation: {
        latitude: storeAddress.latitude,
        longitude: storeAddress.longitude,
        address: storeAddress.address
      },
      clientLocation: {
        latitude: clientLat,
        longitude: clientLng
      }
    }

    console.log('✅ Respuesta de cálculo:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error al calcular precio de envío:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
