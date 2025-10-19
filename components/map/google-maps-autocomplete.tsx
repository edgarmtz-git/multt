'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { useGoogleMaps } from '@/lib/hooks/use-google-maps'
import FallbackLocationInput from './fallback-location-input'

interface GoogleMapsAutocompleteProps {
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }) => void
  initialValue?: string
  className?: string
}

export default function GoogleMapsAutocomplete({ 
  onLocationSelect, 
  initialValue = '',
  className = "h-64 w-full" 
}: GoogleMapsAutocompleteProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const { isLoaded, isLoading, error } = useGoogleMaps()

  // Inicializar mapa y autocompletado
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !inputRef.current || isInitialized) return

    try {
      // Crear mapa
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      })

      // Crear marcador
      markerRef.current = new window.google.maps.Marker({
        position: { lat: 19.4326, lng: -99.1332 },
        map: mapInstanceRef.current,
        draggable: true,
        title: 'Tu ubicación'
      })

      // Configurar autocompletado
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'mx' } // Restringir a México
      })

      // Manejar selección del autocompletado
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        
        if (place.geometry && place.geometry.location) {
          const location = place.geometry.location
          const lat = location.lat()
          const lng = location.lng()
          
          // Actualizar mapa y marcador
          mapInstanceRef.current.setCenter({ lat, lng })
          mapInstanceRef.current.setZoom(18)
          markerRef.current.setPosition({ lat, lng })
          
          // Llamar callback
          onLocationSelect(place.formatted_address, { lat, lng })
        }
      })

      // Manejar arrastre del marcador
      markerRef.current.addListener('dragend', () => {
        const position = markerRef.current.getPosition()
        const lat = position.lat()
        const lng = position.lng()
        
        // Hacer geocodificación inversa
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address
            if (inputRef.current) {
              inputRef.current.value = address
            }
            onLocationSelect(address, { lat, lng })
          }
        })
      })

      setIsInitialized(true)
    } catch (error) {
      console.error('Error initializing Google Maps:', error)
    }
  }, [isLoaded, onLocationSelect, isInitialized])

  // Si hay error (API key no configurada), mostrar fallback
  if (error) {
    return (
      <FallbackLocationInput
        onLocationSelect={onLocationSelect}
        initialValue={initialValue}
        className={className}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Input de búsqueda */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Busca tu dirección o arrastra el marcador en el mapa"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          defaultValue={initialValue}
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {/* Mapa */}
      <div className="relative">
        <div
          ref={mapRef}
          className={`${className} rounded-lg border-2 border-gray-300 overflow-hidden`}
        />
        
        {(isLoading || !isLoaded) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="text-sm text-gray-600">
        <p><strong>Instrucciones:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Escribe tu dirección en el campo de búsqueda</li>
          <li>O arrastra el marcador rojo en el mapa</li>
          <li>El mapa se centrará automáticamente en tu ubicación</li>
        </ul>
      </div>
    </div>
  )
}
