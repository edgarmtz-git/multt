// Utilidades para geolocalización y geocodificación

export interface GeolocationCoordinates {
  lat: number
  lng: number
}

export interface AddressComponents {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface GeocodingResult {
  address: AddressComponents
  coordinates: GeolocationCoordinates
  formattedAddress: string
}

// Obtener ubicación actual del usuario
export const getCurrentLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La geolocalización no está disponible en este dispositivo'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        let message = 'Error al obtener la ubicación'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permisos de ubicación denegados'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Ubicación no disponible'
            break
          case error.TIMEOUT:
            message = 'Tiempo de espera agotado'
            break
        }
        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    )
  })
}

// Geocodificación inversa usando Google Maps API
export const reverseGeocode = async (
  coordinates: GeolocationCoordinates,
  apiKey?: string
): Promise<GeocodingResult> => {
  if (!apiKey) {
    // Fallback con datos simulados para desarrollo
    return getMockGeocodingResult(coordinates)
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${apiKey}&language=es&region=mx`
    )
    
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('No se pudo obtener la dirección')
    }

    const result = data.results[0]
    const addressComponents = parseGoogleMapsResult(result)
    
    return {
      address: addressComponents,
      coordinates,
      formattedAddress: result.formatted_address
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error)
    // Fallback a datos simulados
    return getMockGeocodingResult(coordinates)
  }
}

// Parsear resultado de Google Maps API
const parseGoogleMapsResult = (result: any): AddressComponents => {
  const components = result.address_components
  const address: AddressComponents = {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  }

  components.forEach((component: any) => {
    const types = component.types
    
    if (types.includes('route')) {
      address.street = component.long_name
    } else if (types.includes('street_number')) {
      address.number = component.long_name
    } else if (types.includes('sublocality') || types.includes('neighborhood')) {
      address.neighborhood = component.long_name
    } else if (types.includes('locality')) {
      address.city = component.long_name
    } else if (types.includes('administrative_area_level_1')) {
      address.state = component.long_name
    } else if (types.includes('postal_code')) {
      address.zipCode = component.long_name
    } else if (types.includes('country')) {
      address.country = component.long_name
    }
  })

  return address
}

// Datos simulados para desarrollo
const getMockGeocodingResult = (coordinates: GeolocationCoordinates): GeocodingResult => {
  // Simular diferentes direcciones basadas en coordenadas
  const mockAddresses = [
    {
      street: 'Avenida Insurgentes',
      number: '123',
      neighborhood: 'Roma Norte',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06700',
      country: 'México'
    },
    {
      street: 'Calle Reforma',
      number: '456',
      neighborhood: 'Centro',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06000',
      country: 'México'
    },
    {
      street: 'Calle Principal',
      number: '789',
      neighborhood: 'Polanco',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '11560',
      country: 'México'
    }
  ]

  // Seleccionar dirección basada en coordenadas (simulación)
  const index = Math.abs(Math.floor(coordinates.lat * coordinates.lng)) % mockAddresses.length
  const address = mockAddresses[index]

  return {
    address,
    coordinates,
    formattedAddress: `${address.street} ${address.number}, ${address.neighborhood}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`
  }
}

// Validar formato de WhatsApp
export const validateWhatsAppNumber = (number: string): boolean => {
  const cleanNumber = number.replace(/\D/g, '')
  return cleanNumber.length >= 10 && cleanNumber.length <= 15
}

// Formatear número de WhatsApp para enlaces
export const formatWhatsAppNumber = (number: string): string => {
  const cleanNumber = number.replace(/\D/g, '')
  return cleanNumber.startsWith('52') ? cleanNumber : `52${cleanNumber}`
}

// Calcular distancia entre dos puntos (Haversine formula)
export const calculateDistance = (
  point1: GeolocationCoordinates,
  point2: GeolocationCoordinates
): number => {
  const R = 6371 // Radio de la Tierra en kilómetros
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLng = (point2.lng - point1.lng) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
