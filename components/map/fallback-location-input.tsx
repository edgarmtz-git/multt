'use client'

import { useState } from 'react'
import { MapPin, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FallbackLocationInputProps {
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }) => void
  initialValue?: string
  className?: string
}

export default function FallbackLocationInput({ 
  onLocationSelect, 
  initialValue = '',
  className = "h-64 w-full" 
}: FallbackLocationInputProps) {
  const [address, setAddress] = useState(initialValue)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada por este navegador')
      return
    }

    setIsGettingLocation(true)
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords
      
      // Simular una dirección basada en las coordenadas
      const simulatedAddress = `Ubicación: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      
      setAddress(simulatedAddress)
      onLocationSelect(simulatedAddress, { lat: latitude, lng: longitude })
      
    } catch (error) {
      console.error('Error getting location:', error)
      alert('No se pudo obtener la ubicación. Por favor ingresa tu dirección manualmente.')
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleAddressChange = (value: string) => {
    setAddress(value)
    // Simular coordenadas para desarrollo
    const simulatedCoords = { lat: 19.4326, lng: -99.1332 }
    onLocationSelect(value, simulatedCoords)
  }

  return (
    <div className="space-y-4">
      {/* Input de búsqueda */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Ingresa tu dirección completa"
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
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            Obteniendo ubicación...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 mr-2" />
            Obtener mi ubicación
          </>
        )}
      </Button>

      {/* Mapa simulado */}
      <div className={`${className} bg-gradient-to-br from-green-100 to-blue-100 border-2 border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">Mapa no disponible</p>
          <p className="text-sm text-gray-500">Google Maps API no configurada</p>
          <p className="text-xs text-gray-400 mt-2">
            {address ? `Dirección: ${address}` : 'Ingresa tu dirección arriba'}
          </p>
        </div>
      </div>

      {/* Aviso de configuración */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">Google Maps no configurado</p>
            <p className="text-yellow-700 mt-1">
              Para habilitar el mapa interactivo, configura la variable de entorno{' '}
              <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> en tu archivo .env
            </p>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="text-sm text-gray-600">
        <p><strong>Instrucciones:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Escribe tu dirección completa en el campo de arriba</li>
          <li>O usa el botón "Obtener mi ubicación" para GPS</li>
          <li>Los campos de dirección se llenarán automáticamente</li>
        </ul>
      </div>
    </div>
  )
}

