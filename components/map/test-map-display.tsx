'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, ExternalLink } from 'lucide-react'

interface TestMapDisplayProps {
  address: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
  height?: string
  className?: string
}

export default function TestMapDisplay({ 
  address, 
  latitude, 
  longitude, 
  googleMapsUrl,
  height = '250px',
  className = ''
}: TestMapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!latitude || !longitude) {
      return
    }

    console.log(`🧪 TestMapDisplay: Coordenadas recibidas: ${latitude}, ${longitude}`)

    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      try {
        // Cargar CSS
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)

        // Cargar JavaScript
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        script.crossOrigin = ''
        script.async = true
        script.defer = true

        script.onload = () => {
          console.log('✅ Leaflet cargado correctamente')
          setIsLoaded(true)
        }

        script.onerror = () => {
          console.error('❌ Error cargando Leaflet')
          setHasError(true)
        }

        document.head.appendChild(script)
      } catch (err) {
        console.error('❌ Error inicializando Leaflet:', err)
        setHasError(true)
      }
    }

    loadLeaflet()
  }, [latitude, longitude])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.L) return

    try {
      console.log(`🗺️ TestMapDisplay: Creando mapa en coordenadas: ${latitude}, ${longitude}`)
      
      // Crear mapa
      const map = window.L.map(mapRef.current).setView([latitude!, longitude!], 15)

      // Agregar capa de tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      // Crear marcador
      const marker = window.L.marker([latitude!, longitude!], {
        title: address
      }).addTo(map)

      // Asegurar que el mapa se centre correctamente
      map.setView([latitude!, longitude!], 15)
      
      console.log(`✅ TestMapDisplay: Mapa creado y centrado en: ${latitude}, ${longitude}`)

      // Limpiar al desmontar
      return () => {
        if (map) {
          map.remove()
        }
      }
    } catch (err) {
      console.error('❌ TestMapDisplay: Error creando mapa:', err)
      setHasError(true)
    }
  }, [isLoaded, latitude, longitude, address])

  if (hasError || !latitude || !longitude) {
    return (
      <div 
        className={`relative bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500 p-4">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Ubicación seleccionada</p>
          <p className="text-xs text-gray-400 mt-1">{address}</p>
          <p className="text-xs text-gray-400 mt-1">Coordenadas: {latitude}, {longitude}</p>
          {googleMapsUrl && (
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              <ExternalLink className="w-3 h-3 inline mr-1" />
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center">
          <div className="text-green-600 mr-2">✅</div>
          <div>
            <h3 className="text-sm font-medium text-green-800">Mapa de Prueba</h3>
            <p className="text-sm text-green-700 mt-1">
              Coordenadas: {latitude}, {longitude}
            </p>
          </div>
        </div>
      </div>
      
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
          <ExternalLink className="w-3 h-3 inline mr-1" />
          Ver en Google Maps
        </a>
      )}
    </div>
  )
}

// Declarar tipos globales para Leaflet
declare global {
  interface Window {
    L: any
  }
}
