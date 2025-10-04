'use client'

import { useState, useEffect, useRef } from 'react'

interface FallbackMapProps {
  center: { lat: number; lng: number }
  onLocationChange: (lat: number, lng: number) => void
  height?: string
}

export default function FallbackMap({ center, onLocationChange, height = '400px' }: FallbackMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
          setIsLoaded(true)
        }

        script.onerror = () => {
          setError('Error loading Leaflet map library')
        }

        document.head.appendChild(script)
      } catch (err) {
        setError('Error initializing map')
      }
    }

    loadLeaflet()
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.L) return

    try {
      // Crear mapa
      const map = window.L.map(mapRef.current).setView([center.lat, center.lng], 15)

      // Agregar capa de tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      // Crear marcador
      const marker = window.L.marker([center.lat, center.lng], {
        draggable: true
      }).addTo(map)

      // Evento cuando se arrastra el marcador
      marker.on('dragend', (e) => {
        const position = e.target.getLatLng()
        onLocationChange(position.lat, position.lng)
      })

      // Evento cuando se hace clic en el mapa
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        onLocationChange(lat, lng)
      })

      // Limpiar al desmontar
      return () => {
        if (map) {
          map.remove()
        }
      }
    } catch (err) {
      setError('Error creating map')
    }
  }, [isLoaded, center, onLocationChange])

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Map Error</h3>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      style={{ height }} 
      className="w-full rounded-lg border border-gray-300"
    />
  )
}

// Declarar tipos globales para Leaflet
declare global {
  interface Window {
    L: any
  }
}
