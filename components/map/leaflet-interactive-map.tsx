'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LeafletInteractiveMapProps {
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }) => void
  initialCoordinates?: { lat: number; lng: number }
  className?: string
}

export default function LeafletInteractiveMap({
  onLocationSelect,
  initialCoordinates,
  className = 'h-64 w-full'
}: LeafletInteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [address, setAddress] = useState('')

  // Función para cargar Leaflet dinámicamente
  const loadLeaflet = async () => {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (typeof window !== 'undefined' && (window as any).L) {
        resolve((window as any).L)
        return
      }

      // Cargar CSS de Leaflet
      const cssLink = document.createElement('link')
      cssLink.rel = 'stylesheet'
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      cssLink.crossOrigin = ''
      document.head.appendChild(cssLink)

      // Cargar JavaScript de Leaflet
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      script.onload = () => {
        resolve((window as any).L)
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Función para obtener la dirección desde coordenadas (reverse geocoding)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MulttApp/1.0'
          }
        }
      )
      
      if (!response.ok) throw new Error('Error en geocodificación')
      
      const data = await response.json()
      
      if (data && data.display_name) {
        return data.display_name
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      console.error('Error en reverse geocoding:', error)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  // Función para obtener ubicación GPS
  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'))
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
          let message = 'Error al obtener ubicación'
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
          maximumAge: 60000
        }
      )
    })
  }

  // Inicializar mapa
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      try {
        setIsLoading(true)
        
        // Cargar Leaflet
        const L = await loadLeaflet() as any
        
        // Verificar si el contenedor ya tiene un mapa
        if ((mapRef.current as any)._leaflet_id) {
          return // Ya está inicializado
        }
        
        // Coordenadas por defecto (Ciudad de México)
        const defaultCoords: [number, number] = [19.4326, -99.1332]
        
        // Usar coordenadas iniciales o obtener ubicación GPS
        let coords: [number, number]
        
        if (initialCoordinates) {
          coords = [initialCoordinates.lat, initialCoordinates.lng]
        } else {
          try {
            const gpsLocation = await getCurrentLocation()
            coords = [gpsLocation.lat, gpsLocation.lng]
          } catch (error) {
            console.warn('No se pudo obtener GPS, usando ubicación por defecto:', error)
            coords = defaultCoords
          }
        }

        // Crear mapa
        const newMap = L.map(mapRef.current).setView(coords, 16)
        
        // Agregar tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(newMap)

        // Crear marcador arrastrable
        const newMarker = L.marker(coords, { draggable: true }).addTo(newMap)
        
        // Obtener dirección inicial
        const initialAddress = await reverseGeocode(coords[0], coords[1])
        setAddress(initialAddress)
        onLocationSelect(initialAddress, { lat: coords[0], lng: coords[1] })

        // Evento cuando se arrastra el marcador
        newMarker.on('dragend', async () => {
          const newCoords = newMarker.getLatLng()
          const newAddress = await reverseGeocode(newCoords.lat, newCoords.lng)
          setAddress(newAddress)
          onLocationSelect(newAddress, { lat: newCoords.lat, lng: newCoords.lng })
        })

        setMap(newMap)
        setMarker(newMarker)

      } catch (error) {
        console.error('Error inicializando mapa:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initMap()

    // Cleanup
    return () => {
      if (map && mapRef.current) {
        map.remove()
        // Limpiar la referencia del contenedor
        if ((mapRef.current as any)._leaflet_id) {
          delete (mapRef.current as any)._leaflet_id
        }
      }
    }
  }, [])

  // Función para centrar en ubicación actual
  const centerOnCurrentLocation = async () => {
    if (!map || !marker) return

    try {
      setIsLoading(true)
      const location = await getCurrentLocation()
      const coords: [number, number] = [location.lat, location.lng]
      
      map.setView(coords, 16)
      marker.setLatLng(coords)
      
      const newAddress = await reverseGeocode(location.lat, location.lng)
      setAddress(newAddress)
      onLocationSelect(newAddress, location)
      
    } catch (error) {
      console.error('Error centrando en ubicación actual:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botón para centrar en ubicación actual */}
      <div className="absolute top-2 right-2 z-[1000]">
        <Button
          size="sm"
          onClick={centerOnCurrentLocation}
          disabled={isLoading}
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Contenedor del mapa */}
      <div ref={mapRef} className="w-full h-full rounded-lg border" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}


      {/* Instrucciones */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        💡 Arrastra el pin azul para ajustar tu ubicación exacta
      </div>
    </div>
  )
}