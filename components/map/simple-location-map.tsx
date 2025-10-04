'use client'

import { useState, useEffect } from 'react'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SimpleLocationMapProps {
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }) => void
  initialValue?: string
  className?: string
}

export default function SimpleLocationMap({ 
  onLocationSelect, 
  initialValue = '',
  className = "h-64 w-full" 
}: SimpleLocationMapProps) {
  const [address, setAddress] = useState(initialValue)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por este navegador')
      return
    }

    setIsGettingLocation(true)
    setError(null)
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords
      const coords = { lat: latitude, lng: longitude }
      
      setCoordinates(coords)
      
      // Crear una dirección básica basada en las coordenadas
      const basicAddress = `Ubicación: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      setAddress(basicAddress)
      
      onLocationSelect(basicAddress, coords)
      
    } catch (error) {
      console.error('Error getting location:', error)
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Permisos de ubicación denegados. Por favor permite el acceso a la ubicación.')
            break
          case error.POSITION_UNAVAILABLE:
            setError('Ubicación no disponible. Verifica tu conexión GPS.')
            break
          case error.TIMEOUT:
            setError('Tiempo de espera agotado. Intenta de nuevo.')
            break
          default:
            setError('Error al obtener la ubicación. Intenta de nuevo.')
        }
      } else {
        setError('Error inesperado al obtener la ubicación.')
      }
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleAddressChange = (value: string) => {
    setAddress(value)
    // Si hay coordenadas, mantenerlas; si no, usar coordenadas por defecto
    const coords = coordinates || { lat: 19.4326, lng: -99.1332 }
    onLocationSelect(value, coords)
  }

  return (
    <div className="space-y-4">
      {/* Input de dirección */}
      <div className="relative">
        <input
          type="text"
          placeholder="Ingresa tu dirección o usa el botón para obtener tu ubicación"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {/* Botón de ubicación GPS */}
      <Button 
        onClick={handleGetLocation}
        disabled={isGettingLocation}
        className="w-full"
        variant="outline"
      >
        {isGettingLocation ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Obteniendo tu ubicación...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 mr-2" />
            Obtener mi ubicación con GPS
          </>
        )}
      </Button>

      {/* Mapa simple */}
      <div className={`${className} bg-gradient-to-br from-green-100 to-blue-100 border-2 border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden`}>
        {coordinates ? (
          <div className="text-center">
            <MapPin className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Tu ubicación</p>
            <p className="text-sm text-gray-600">
              Lat: {coordinates.lat.toFixed(6)}
            </p>
            <p className="text-sm text-gray-600">
              Lng: {coordinates.lng.toFixed(6)}
            </p>
            {address && (
              <p className="text-xs text-gray-500 mt-2 max-w-xs truncate">
                {address}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Ubicación no seleccionada</p>
            <p className="text-sm text-gray-500">Usa el botón para obtener tu ubicación</p>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-800">Error de ubicación</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="text-sm text-gray-600">
        <p><strong>Instrucciones:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Escribe tu dirección en el campo de arriba</li>
          <li>O usa el botón "Obtener mi ubicación" para usar GPS</li>
          <li>Los campos de dirección se llenarán automáticamente</li>
        </ul>
      </div>
    </div>
  )
}
