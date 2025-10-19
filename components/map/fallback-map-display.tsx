'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface FallbackMapDisplayProps {
  address: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
  height?: string
  className?: string
}

export default function FallbackMapDisplay({
  address,
  latitude,
  longitude,
  googleMapsUrl,
  height = '200px',
  className = ''
}: FallbackMapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si no hay coordenadas, no cargar el mapa
    if (!latitude || !longitude) {
      return
    }

    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      try {
        // Verificar si ya está cargado
        if (window.L) {
          setIsLoaded(true)
          return
        }

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
          setIsLoaded(true)
        }

        script.onerror = () => {
          setError('Error loading map library')
        }

        document.head.appendChild(script)
      } catch (err) {
        setError('Error initializing map')
      }
    }

    loadLeaflet()
  }, [latitude, longitude])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.L || !latitude || !longitude) return

    try {
      // Crear mapa (solo lectura)
      const map = window.L.map(mapRef.current, {
        dragging: false,
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        touchZoom: false
      }).setView([latitude, longitude], 15)

      // Agregar capa de tiles de OpenStreetMap
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      // Crear marcador fijo
      window.L.marker([latitude, longitude]).addTo(map)

      // Limpiar al desmontar
      return () => {
        if (map) {
          map.remove()
        }
      }
    } catch (err) {
      console.error('Error creating map:', err)
      setError('Error creating map')
    }
  }, [isLoaded, latitude, longitude])

  // Si hay error, mostrar fallback estático
  if (error) {
    return (
      <div
        className={`relative bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500 p-4">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Ubicación</p>
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

  // Si está cargando
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
          Ver en OpenStreetMap →
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
