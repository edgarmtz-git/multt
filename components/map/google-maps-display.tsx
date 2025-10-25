'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import FallbackMapDisplay from './fallback-map-display'

interface GoogleMapsDisplayProps {
  address: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
  height?: string
  className?: string
}

export default function GoogleMapsDisplay({ 
  address, 
  latitude, 
  longitude, 
  googleMapsUrl,
  height = '200px',
  className = ''
}: GoogleMapsDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Si no hay coordenadas, no cargar el mapa
    if (!latitude || !longitude) {
      return
    }

    // Verificar si ya hay un error de facturación conocido
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Si ya existe el script y sabemos que hay error de facturación, usar fallback directamente
      setHasError(true)
      return
    }

    // Cargar Google Maps API dinámicamente
    const loadGoogleMaps = async () => {
      try {
        // Verificar si ya está cargado
        if (window.google && window.google.maps) {
          setIsLoaded(true)
          return
        }

        // Cargar el script
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true

        script.onload = () => setIsLoaded(true)
        script.onerror = () => setHasError(true)

        document.head.appendChild(script)
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        setHasError(true)
      }
    }

    // Detectar errores de facturación
    const handleBillingError = () => {
      setHasError(true)
    }

    // Escuchar errores de Google Maps
    window.addEventListener('google-maps-billing-error', handleBillingError)

    loadGoogleMaps()

    return () => {
      window.removeEventListener('google-maps-billing-error', handleBillingError)
    }
  }, [latitude, longitude])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google || !latitude || !longitude) return

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: latitude, lng: longitude },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      // Crear marcador
      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: address
      })

    } catch (error) {
      console.error('Error creating map:', error)
      // Verificar si es un error de facturación
      if (error instanceof Error && error.message.includes('BillingNotEnabled')) {
        setHasError(true)
      } else {
        setHasError(true)
      }
    }
  }, [isLoaded, latitude, longitude, address])

  // Si hay error de Google Maps, usar mapa de respaldo
  if (hasError) {
    return (
      <div className="space-y-2">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Google Maps no disponible</h3>
              <p className="text-sm text-yellow-700 mt-1">
                La facturación no está habilitada. Usando mapa alternativo.
              </p>
            </div>
          </div>
        </div>
        <FallbackMapDisplay
          address={address}
          latitude={latitude}
          longitude={longitude}
          googleMapsUrl={googleMapsUrl}
          height={height}
          className={className}
        />
      </div>
    )
  }

  // Si no hay coordenadas, mostrar placeholder
  if (!latitude || !longitude) {
    return (
      <div 
        className={`relative bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500 p-4">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Ubicación seleccionada</p>
          <p className="text-xs text-gray-400 mt-1">{address}</p>
          {googleMapsUrl && (
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Ver en Google Maps
            </a>
          )}
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div 
        className={`relative bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div 
        ref={mapRef} 
        className={`w-full rounded-lg border border-gray-300 ${className}`}
        style={{ height }}
      />
      {googleMapsUrl && (
        <a 
          href={googleMapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 inline-block"
        >
          Ver en Google Maps →
        </a>
      )}
    </div>
  )
}

// Declarar tipos globales
declare global {
  interface Window {
    google: any
  }
}
