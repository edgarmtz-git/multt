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
import { MapPin, ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import SimpleAddressModal from './simple-address-modal'
import GoogleMapsUrlModal from './google-maps-url-modal'

interface AddressData {
  address: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
}

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: AddressData) => void
  initialAddress?: AddressData
}

export function AddressModal({ isOpen, onClose, onSave, initialAddress }: AddressModalProps) {
  const [step, setStep] = useState<'address' | 'maps' | 'complete'>('address')
  const [address, setAddress] = useState<AddressData>({
    address: '',
    latitude: 19.4326, // Coordenadas por defecto de Ciudad de México
    longitude: -99.1332,
    googleMapsUrl: '',
    ...initialAddress
  })
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showMapsModal, setShowMapsModal] = useState(false)

  const handleAddressNext = (addressText: string) => {
    setAddress(prev => ({ ...prev, address: addressText }))
    setShowAddressModal(false)
    setShowMapsModal(true)
  }

  const handleMapsConfirm = async (url: string) => {
    // Extraer coordenadas de la URL de Google Maps
    const coords = await extractCoordinates(url)
    if (coords) {
      setAddress(prev => ({ 
        ...prev, 
        googleMapsUrl: url,
        latitude: coords.lat,
        longitude: coords.lng
      }))
    } else {
      setAddress(prev => ({ ...prev, googleMapsUrl: url }))
    }
    setShowMapsModal(false)
    setStep('complete')
  }

  const handleSave = () => {
    onSave(address)
    onClose()
  }

  const handleClose = () => {
    setStep('address')
    setShowAddressModal(false)
    setShowMapsModal(false)
    onClose()
  }

  const extractCoordinates = async (url: string) => {
    try {
      // Para URLs que contienen coordenadas directamente, extraer localmente
      if (url.includes('@') || url.includes('!3d') || url.includes('ll=') || url.includes('q=')) {
        const patterns = [
          /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
          /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
          /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
          /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng
        ]
        
        for (const pattern of patterns) {
          const match = url.match(pattern)
          if (match) {
            return {
              lat: parseFloat(match[1]),
              lng: parseFloat(match[2])
            }
          }
        }
      }

      // Para URLs cortas, usar el endpoint API
      if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
        const response = await fetch('/api/expand-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            return {
              lat: data.latitude,
              lng: data.longitude
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error extracting coordinates:', error)
      return null
    }
  }

  const handleMapsUrlChange = async (url: string) => {
    const coords = await extractCoordinates(url)
    if (coords) {
      setAddress(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng
      }))
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Configurar Dirección
            </DialogTitle>
            <DialogDescription>
              Configure la dirección de su local en dos pasos simples
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {step === 'address' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Paso 1: Dirección del Local</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Ingrese la dirección completa de su local o negocio
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Dirección actual:</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {address.address ? (
                      <p className="text-sm">{address.address}</p>
                    ) : (
                      <p className="text-sm text-gray-500">No configurada</p>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => setShowAddressModal(true)}
                  className="w-full"
                >
                  {address.address ? 'Cambiar Dirección' : 'Agregar Dirección'}
                </Button>
              </div>
            )}

            {step === 'maps' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Paso 2: Ubicación en Google Maps</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Obtenga la URL de Google Maps para la ubicación exacta
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>URL de Google Maps:</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {address.googleMapsUrl ? (
                      <p className="text-sm break-all">{address.googleMapsUrl}</p>
                    ) : (
                      <p className="text-sm text-gray-500">No configurada</p>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => setShowMapsModal(true)}
                  className="w-full"
                >
                  {address.googleMapsUrl ? 'Cambiar URL' : 'Obtener URL de Google Maps'}
                </Button>
              </div>
            )}

            {step === 'complete' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">¡Configuración Completa!</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Su dirección ha sido configurada correctamente
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-blue-900 font-medium">Dirección:</Label>
                    <p className="text-sm text-blue-800 mt-1">{address.address}</p>
                  </div>

                  {address.latitude && address.longitude && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <Label className="text-green-900 font-medium">Coordenadas:</Label>
                      <p className="text-sm text-green-800 mt-1">
                        Lat: {address.latitude.toFixed(6)}, Lng: {address.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}

                  {address.googleMapsUrl && (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <Label className="text-gray-900 font-medium">URL de Google Maps:</Label>
                      <p className="text-sm text-gray-700 mt-1 break-all">{address.googleMapsUrl}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {step === 'maps' && (
                <Button variant="outline" onClick={() => setStep('address')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Atrás
                </Button>
              )}
              {step === 'complete' && (
                <Button variant="outline" onClick={() => setStep('maps')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Atrás
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              {step === 'address' && address.address && (
                <Button onClick={() => setStep('maps')}>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {step === 'maps' && address.googleMapsUrl && (
                <Button onClick={() => setStep('complete')}>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {step === 'complete' && (
                <Button onClick={handleSave}>
                  Confirmar
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modales auxiliares */}
      <SimpleAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={(newAddress) => {
          setAddress(newAddress)
          setShowAddressModal(false)
          setShowMapsModal(true)
        }}
        initialAddress={address}
      />

      <GoogleMapsUrlModal
        isOpen={showMapsModal}
        onClose={() => setShowMapsModal(false)}
        onConfirm={handleMapsConfirm}
        address={typeof address === 'string' ? address : address.address}
        initialUrl={typeof address === 'string' ? undefined : address.googleMapsUrl}
      />
    </>
  )
}
