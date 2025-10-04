'use client'

import { useEffect, useRef, useState } from 'react'
import FallbackMap from './fallback-map'

interface GoogleMapsProps {
  center: { lat: number; lng: number }
  onLocationChange: (lat: number, lng: number) => void
  address?: string
  apiKey: string
  height?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function GoogleMaps({ center, onLocationChange, address, apiKey, height = '400px' }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasBillingError, setHasBillingError] = useState(false)

  // Detectar errores de facturación
  useEffect(() => {
    const handleError = (event: any) => {
      if (event.detail && event.detail.error && event.detail.error.includes('BillingNotEnabled')) {
        setHasBillingError(true)
      }
    }

    window.addEventListener('google-maps-error', handleError)
    return () => window.removeEventListener('google-maps-error', handleError)
  }, [])

  // Cargar Google Maps API
  useEffect(() => {
    if (!apiKey) {
      console.error('Google Maps API Key is required')
      return
    }

    // Verificar si Google Maps ya está cargado
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    // Verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Si ya existe, solo esperar a que se cargue
      const checkGoogleMaps = () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true)
        } else {
          setTimeout(checkGoogleMaps, 100)
        }
      }
      checkGoogleMaps()
      return
    }

    // Cargar el script de Google Maps solo si no existe
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`
    script.async = true
    script.defer = true

    // Función global para inicializar el mapa
    window.initMap = () => {
      setIsLoaded(true)
    }

    // Manejar errores de carga
    script.onerror = () => {
      console.error('Error loading Google Maps API')
      setHasBillingError(true)
    }

    document.head.appendChild(script)

    return () => {
      // No limpiar el script globalmente, solo limpiar la función callback
      delete window.initMap
    }
  }, [apiKey])

  // Inicializar el mapa cuando Google Maps esté cargado
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google || map) return

    try {
      // Crear el mapa
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: center,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true
      })

      // Crear marcador
      const newMarker = new window.google.maps.Marker({
        position: center,
        map: newMap,
        draggable: true,
        title: 'Ubicación seleccionada'
      })

      // Evento cuando se arrastra el marcador
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition()
        if (position) {
          const lat = position.lat()
          const lng = position.lng()
          onLocationChange(lat, lng)
        }
      })

      // Evento cuando se hace clic en el mapa
      newMap.addListener('click', (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        
        // Mover el marcador a la nueva posición
        newMarker.setPosition({ lat, lng })
        onLocationChange(lat, lng)
      })

      setMap(newMap)
      setMarker(newMarker)

    } catch (error) {
      console.error('Error initializing Google Maps:', error)
      // Verificar si es un error de facturación
      if (error instanceof Error && error.message.includes('BillingNotEnabled')) {
        setHasBillingError(true)
      }
    }
  }, [isLoaded, center, onLocationChange, map])

  // Actualizar posición del marcador cuando cambie el centro
  useEffect(() => {
    if (marker && map) {
      marker.setPosition(center)
      map.setCenter(center)
    }
  }, [center, marker, map])

  // Función para geocodificar una dirección
  const geocodeAddress = async (address: string) => {
    if (!window.google || !window.google.maps) return

    const geocoder = new window.google.maps.Geocoder()
    
    try {
      const results = await new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results: any, status: any) => {
          if (status === 'OK') {
            resolve(results)
          } else {
            reject(new Error(`Geocoding failed: ${status}`))
          }
        })
      })

      if (results && (results as any).length > 0) {
        const location = (results as any)[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()
        
        onLocationChange(lat, lng)
        return { lat, lng }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      throw error
    }
  }

  // Exponer función de geocodificación
  useEffect(() => {
    if (map) {
      ;(map as any).geocodeAddress = geocodeAddress
    }
  }, [map])

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (marker) {
        marker.setMap(null)
      }
      if (map) {
        // Limpiar listeners del mapa
        window.google?.maps?.event?.clearInstanceListeners?.(map)
      }
    }
  }, [marker, map])

  // Si hay error de facturación, usar mapa de respaldo
  if (hasBillingError) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Google Maps no disponible</h3>
              <p className="text-sm text-yellow-700 mt-1">
                La facturación no está habilitada para tu API Key. Usando mapa alternativo.
              </p>
            </div>
          </div>
        </div>
        <FallbackMap 
          center={center} 
          onLocationChange={onLocationChange} 
          height={height}
        />
      </div>
    )
  }

  if (!apiKey || apiKey.trim() === '') {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 mb-2">🗺️</div>
          <p className="text-gray-600">Google Maps API Key requerida</p>
          <p className="text-sm text-gray-500">Configura tu API Key en la configuración</p>
          <p className="text-xs text-gray-400 mt-2">API Key recibida: {apiKey ? `"${apiKey}"` : 'undefined'}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        💡 Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación exacta
      </div>
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg border border-gray-300"
      />
      <div className="text-xs text-gray-500">
        Coordenadas: {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
      </div>
    </div>
  )
}
