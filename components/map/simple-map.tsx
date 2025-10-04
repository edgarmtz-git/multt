'use client'

import { MapPin, ExternalLink } from 'lucide-react'

interface SimpleMapProps {
  address: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
  height?: string
  className?: string
}

export default function SimpleMap({ 
  address, 
  latitude, 
  longitude, 
  googleMapsUrl,
  height = '250px',
  className = ''
}: SimpleMapProps) {

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
              className="text-xs text-gray-800 hover:text-black mt-2 inline-block"
            >
              <ExternalLink className="w-3 h-3 inline mr-1" />
              Ver en Google Maps
            </a>
          )}
        </div>
      </div>
    )
  }

  // Crear URL de Google Maps embebido
  const embedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=19&output=embed`

  return (
    <div className="space-y-2">
      <div className="relative">
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className={`rounded-lg ${className}`}
          title={`Mapa de ${address}`}
        />
        
        {/* Overlay con información */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs">
          <span className="font-medium">📍 {address}</span>
        </div>
      </div>

      {googleMapsUrl && (
        <div className="flex justify-center">
          <a 
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-800 hover:text-black inline-flex items-center"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Abrir en Google Maps
          </a>
        </div>
      )}
    </div>
  )
}