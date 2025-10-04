'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MapPin, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface AddressData {
  address: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
}

interface SimpleAddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: AddressData) => void
  initialAddress?: AddressData
}

export default function SimpleAddressModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialAddress 
}: SimpleAddressModalProps) {
  const [address, setAddress] = useState(initialAddress?.address || '')
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initialAddress?.googleMapsUrl || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!address.trim()) {
      toast.error('Por favor ingresa una dirección')
      return
    }

    if (!googleMapsUrl.trim()) {
      toast.error('Por favor ingresa la URL de Google Maps')
      return
    }

    setIsLoading(true)

    try {
      // Extraer coordenadas de la URL de Google Maps
      const coordinates = await extractCoordinatesFromUrl(googleMapsUrl)
      
      const addressData: AddressData = {
        address: address.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        ...coordinates
      }

      onSave(addressData)
      toast.success('Dirección guardada correctamente')
      onClose()
    } catch (error) {
      toast.error('Error al procesar la dirección')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openGoogleMaps = () => {
    if (!address.trim()) {
      toast.error('Primero ingresa una dirección')
      return
    }
    
    const searchQuery = encodeURIComponent(address)
    const googleMapsUrl = `https://www.google.com/maps/search/${searchQuery}`
    window.open(googleMapsUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Configurar Dirección
          </DialogTitle>
          <DialogDescription>
            Ingresa tu dirección y la URL de Google Maps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de dirección */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Ej: Calle mulato rojo manzana 2, modulo 7 residencial los bosques, nacajuca tabasco"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Botón para abrir Google Maps */}
          <div className="space-y-2">
            <Label>Ubicación en Google Maps</Label>
            <Button
              type="button"
              variant="outline"
              onClick={openGoogleMaps}
              className="w-full"
              disabled={!address.trim()}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Google Maps
            </Button>
            <p className="text-xs text-gray-500">
              Esto abrirá Google Maps con tu dirección. Selecciona el punto exacto y copia la URL.
            </p>
          </div>

          {/* Campo de URL de Google Maps */}
          <div className="space-y-2">
            <Label htmlFor="google-maps-url">URL de Google Maps</Label>
            <Input
              id="google-maps-url"
              placeholder="Pega aquí la URL de Google Maps..."
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Pega la URL que obtuviste del botón "Compartir" en Google Maps
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !address.trim() || !googleMapsUrl.trim()}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Función para extraer coordenadas usando el endpoint API
async function extractCoordinatesFromUrl(url: string): Promise<{latitude?: number, longitude?: number}> {
  try {
    const response = await fetch('/api/extract-coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success) {
      return { 
        latitude: data.latitude, 
        longitude: data.longitude 
      }
    } else {
      console.error('Error extracting coordinates:', data.error)
      return {}
    }
  } catch (error) {
    console.error('Error extracting coordinates:', error)
    return {}
  }
}