'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { HelpCircle, ExternalLink, MapPin } from 'lucide-react'
import { toast } from 'sonner'
// import UrlCoordinateExtractor from '@/components/map/url-coordinate-extractor'

interface GoogleMapsUrlModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (url: string) => void
  address: string
  initialUrl?: string
}

export default function GoogleMapsUrlModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  address,
  initialUrl = '' 
}: GoogleMapsUrlModalProps) {
  const [url, setUrl] = useState(initialUrl)
  const [showHelp, setShowHelp] = useState(false)
  const [extractedCoordinates, setExtractedCoordinates] = useState<{lat: number, lng: number} | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onConfirm(url.trim())
    }
  }

  const openGoogleMaps = () => {
    const searchQuery = encodeURIComponent(address)
    const googleMapsUrl = `https://www.google.com.mx/maps/search/${searchQuery}`
    window.open(googleMapsUrl, '_blank')
  }

  const handleCoordinatesExtracted = (lat: number, lng: number, address?: string) => {
    setExtractedCoordinates({ lat, lng })
    console.log('Coordenadas extraídas:', { lat, lng, address })
    // Cuando se extraen coordenadas exitosamente, habilitar el botón de confirmar
    toast.success('Coordenadas extraídas. Puedes confirmar la ubicación.')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Ubicación en Google Maps
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Dirección a localizar:</h3>
                <p className="text-sm text-blue-700 mt-1">{address}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Extractor de coordenadas */}
            {/* <UrlCoordinateExtractor
              onCoordinatesExtracted={handleCoordinatesExtracted}
              initialUrl={url}
            /> */}

            {/* Botón para abrir Google Maps */}
            <Button
              type="button"
              variant="outline"
              onClick={openGoogleMaps}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Google Maps
            </Button>

            {/* Campo manual para URL */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="maps-url">URL de Google Maps (manual)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-1 h-auto"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <Input
                id="maps-url"
                placeholder="O pega aquí la URL de Google Maps..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          {showHelp && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">¿Cómo obtener la URL?</h4>
                <ol className="text-sm space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                    <span>Haz clic en "Abrir Google Maps" para buscar tu dirección</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                    <span>En Google Maps, haz clic derecho en el punto exacto de tu local</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                    <span>Selecciona "¿Qué hay aquí?" para ver las coordenadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span>
                    <span>Copia la URL completa de la barra de direcciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">5</span>
                    <span>Pega la URL en el campo de arriba</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!url.trim()}
            >
              Confirmar Ubicación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
