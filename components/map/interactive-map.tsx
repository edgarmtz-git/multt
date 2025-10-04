'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface InteractiveMapProps {
  center: [number, number]
  onLocationChange: (lat: number, lng: number) => void
  className?: string
}

export default function InteractiveMap({ 
  center, 
  onLocationChange, 
  className = "h-64 w-full" 
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(center)

  // Convertir coordenadas de pantalla a lat/lng (simulación)
  const screenToLatLng = (x: number, y: number, containerWidth: number, containerHeight: number) => {
    // Simulación: convertir posición del pin a coordenadas aproximadas
    const latOffset = (50 - y) / 100 * 0.01 // Aproximadamente 0.01 grados por pixel
    const lngOffset = (x - 50) / 100 * 0.01
    
    return [
      center[0] + latOffset,
      center[1] + lngOffset
    ] as [number, number]
  }

  // Convertir lat/lng a posición de pantalla
  const latLngToScreen = (lat: number, lng: number, containerWidth: number, containerHeight: number) => {
    const latOffset = lat - center[0]
    const lngOffset = lng - center[1]
    
    return {
      x: 50 + (lngOffset / 0.01) * 100,
      y: 50 - (latOffset / 0.01) * 100
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Mantener el pin dentro del mapa
    const clampedX = Math.max(5, Math.min(95, x))
    const clampedY = Math.max(5, Math.min(95, y))

    setPinPosition({ x: clampedX, y: clampedY })

    // Convertir a coordenadas lat/lng
    const [lat, lng] = screenToLatLng(clampedX, clampedY, rect.width, rect.height)
    setCurrentLocation([lat, lng])
    onLocationChange(lat, lng)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100

    // Mantener el pin dentro del mapa
    const clampedX = Math.max(5, Math.min(95, x))
    const clampedY = Math.max(5, Math.min(95, y))

    setPinPosition({ x: clampedX, y: clampedY })

    // Convertir a coordenadas lat/lng
    const [lat, lng] = screenToLatLng(clampedX, clampedY, rect.width, rect.height)
    setCurrentLocation([lat, lng])
    onLocationChange(lat, lng)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Actualizar posición del pin cuando cambie el centro
  useEffect(() => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      const position = latLngToScreen(center[0], center[1], rect.width, rect.height)
      setPinPosition({ x: position.x, y: position.y })
      setCurrentLocation(center)
    }
  }, [center])

  return (
    <div className="relative">
      {/* Mapa de fondo (simulado) */}
      <div
        ref={mapRef}
        className={`${className} bg-gradient-to-br from-green-100 to-blue-100 border-2 border-gray-300 rounded-lg relative overflow-hidden cursor-crosshair select-none`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Líneas de cuadrícula simuladas */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 10}%` }} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 10}%` }} />
          ))}
        </div>

        {/* Pin arrastrable */}
        <div
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${
            isDragging ? 'scale-110' : 'scale-100'
          }`}
          style={{
            left: `${pinPosition.x}%`,
            top: `${pinPosition.y}%`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <MapPin 
            className={`h-8 w-8 ${
              isDragging ? 'text-red-600' : 'text-red-500'
            } drop-shadow-lg`} 
          />
        </div>

        {/* Indicador de coordenadas */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          Lat: {currentLocation[0].toFixed(6)}, Lng: {currentLocation[1].toFixed(6)}
        </div>

        {/* Instrucciones */}
        <div className="absolute top-2 left-2 right-2 text-center">
          <div className="bg-white bg-opacity-90 text-gray-700 text-sm px-3 py-1 rounded-full inline-block">
            Arrastra el pin para ajustar tu ubicación
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-2 text-sm text-gray-600 text-center">
        <p>Mueve el pin rojo para seleccionar tu ubicación exacta</p>
        <p className="text-xs text-gray-500 mt-1">
          En una implementación completa, aquí se mostraría un mapa real de Google Maps
        </p>
      </div>
    </div>
  )
}