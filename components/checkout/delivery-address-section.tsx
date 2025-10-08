'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card } from '@/components/ui/card'
import { MapPin, Loader2, AlertCircle, Truck, Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentLocation } from '@/lib/geolocation'
import LeafletInteractiveMap from '@/components/map/leaflet-interactive-map'
import { cn } from '@/lib/utils'

interface DeliveryZone {
  id: string
  name: string
  type: string
  fixedPrice?: number
  freeDeliveryThreshold?: number
  estimatedTime?: number
  description?: string
  order: number
}

interface DeliveryAddressSectionProps {
  deliveryMethod: 'pickup' | 'delivery'
  calculationMethod: 'distance' | 'zones' | 'manual'
  storeSlug: string
  deliveryZones?: DeliveryZone[]
  pricePerKm?: number
  minDeliveryFee?: number
  maxDeliveryDistance?: number
  manualDeliveryMessage?: string
  subtotal: number
  addressFields: any
  setAddressFields: (fields: any) => void
  selectedZone: string | null
  setSelectedZone: (zone: string | null) => void
  calculatedDeliveryFee: number
  setCalculatedDeliveryFee: (fee: number) => void
  deliveryCalculation: any
  setDeliveryCalculation: (calc: any) => void
}

export default function DeliveryAddressSection({
  deliveryMethod,
  calculationMethod,
  storeSlug,
  deliveryZones = [],
  pricePerKm,
  minDeliveryFee,
  maxDeliveryDistance,
  manualDeliveryMessage,
  subtotal,
  addressFields,
  setAddressFields,
  selectedZone,
  setSelectedZone,
  calculatedDeliveryFee,
  setCalculatedDeliveryFee,
  deliveryCalculation,
  setDeliveryCalculation
}: DeliveryAddressSectionProps) {
  const [showMap, setShowMap] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [openZoneCombobox, setOpenZoneCombobox] = useState(false)

  // Solo mostrar si es delivery
  if (deliveryMethod !== 'delivery') return null

  // Captura de ubicación GPS
  const handleGetLocation = async () => {
    setIsGettingLocation(true)

    try {
      const coordinates = await getCurrentLocation()

      const basicAddress = {
        street: 'Dirección obtenida por GPS',
        number: '',
        neighborhood: 'Colonia',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '',
        reference: '',
        street1: '',
        street2: '',
        houseType: '',
        coordinates: coordinates
      }

      setAddressFields(basicAddress)
      setSelectedLocation([coordinates.lat, coordinates.lng])
      setShowMap(true)

      // Calcular envío automáticamente si es por distancia
      if (calculationMethod === 'distance') {
        await calculateDeliveryPrice(coordinates.lat, coordinates.lng)
      }

      toast.success('Ubicación obtenida correctamente')
    } catch (error) {
      console.error('Error getting location:', error)
      toast.error(error instanceof Error ? error.message : 'No se pudo obtener la ubicación')
    } finally {
      setIsGettingLocation(false)
    }
  }

  // Manejar selección de ubicación desde el mapa
  const handleLocationSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    const addressParts = address.split(',')
    setAddressFields((prev: any) => ({
      ...prev,
      coordinates,
      street: addressParts[0]?.trim() || '',
      neighborhood: addressParts[1]?.trim() || '',
      city: addressParts[2]?.trim() || '',
      state: addressParts[3]?.trim() || '',
      number: prev.number || '',
      reference: prev.reference || '',
      street1: prev.street1 || '',
      street2: prev.street2 || '',
      houseType: prev.houseType || ''
    }))

    setSelectedLocation([coordinates.lat, coordinates.lng])

    // Calcular precio de envío si es por distancia
    if (calculationMethod === 'distance') {
      calculateDeliveryPrice(coordinates.lat, coordinates.lng)
    }
  }

  // Función para calcular precio de envío por distancia
  const calculateDeliveryPrice = async (clientLat: number, clientLng: number) => {
    setIsCalculatingDelivery(true)

    try {
      const response = await fetch('/api/delivery/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientLat,
          clientLng,
          storeSlug
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDeliveryCalculation(data)
        setCalculatedDeliveryFee(data.price || 0)

        if (!data.isWithinRange) {
          toast.error(data.message)
        } else {
          toast.success(data.message)
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al calcular el envío')
      }
    } catch (error) {
      toast.error('Error al calcular el envío')
    } finally {
      setIsCalculatingDelivery(false)
    }
  }

  // Manejar selección de zona
  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId)
    const zone = deliveryZones.find(z => z.id === zoneId)
    if (zone) {
      // Calcular costo basado en umbral de envío gratis
      let cost = zone.fixedPrice || 0
      if (zone.freeDeliveryThreshold && subtotal >= zone.freeDeliveryThreshold) {
        cost = 0
      }
      setCalculatedDeliveryFee(cost)
      setDeliveryCalculation({
        method: 'zones',
        zone: zone.name,
        price: cost,
        estimatedTime: zone.estimatedTime,
        message: cost === 0 ? 'Envío gratis' : `Envío a ${zone.name}`
      })
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        {calculationMethod === 'zones' ? 'Zona de Entrega' : 'Ubicación de Entrega'}
      </h3>

      {/* MÉTODO POR DISTANCIA */}
      {calculationMethod === 'distance' && (
        <>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Cálculo por distancia</p>
                <p className="text-xs text-blue-700 mt-1">
                  {pricePerKm && `$${pricePerKm}/km`}
                  {minDeliveryFee && minDeliveryFee > 0 && ` • Mínimo $${minDeliveryFee}`}
                  {` • Máximo ${maxDeliveryDistance || 10}km`}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Obtener mi ubicación GPS
              </>
            )}
          </Button>

          {showMap && (
            <div className="space-y-4">
              <LeafletInteractiveMap
                onLocationSelect={handleLocationSelect}
                initialCoordinates={selectedLocation ? { lat: selectedLocation[0], lng: selectedLocation[1] } : undefined}
                className="h-80 w-full rounded-lg"
              />
            </div>
          )}

          {/* Mostrar cálculo en tiempo real */}
          {deliveryCalculation && deliveryCalculation.method === 'distance' && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Distancia calculada:</span>
                  <span className="text-lg font-bold text-green-700">{deliveryCalculation.distance} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Costo de envío:</span>
                  <span className="text-lg font-bold text-green-700">${calculatedDeliveryFee.toFixed(2)}</span>
                </div>
                {deliveryCalculation.isWithinRange === false && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Fuera del rango de entrega</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* MÉTODO POR ZONAS */}
      {calculationMethod === 'zones' && (
        <>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Zona de entrega *</Label>
              <Popover open={openZoneCombobox} onOpenChange={setOpenZoneCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openZoneCombobox}
                    className="w-full h-12 justify-between text-base"
                  >
                    {selectedZone
                      ? deliveryZones.find((zone) => zone.id === selectedZone)?.name
                      : "Selecciona tu zona..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar zona..." className="h-12" />
                    <CommandList className="max-h-[200px]">
                      <CommandEmpty>No se encontró ninguna zona.</CommandEmpty>
                      <CommandGroup>
                        {deliveryZones.map((zone) => (
                          <CommandItem
                            key={zone.id}
                            value={zone.name}
                            onSelect={() => {
                              handleZoneSelect(zone.id)
                              setOpenZoneCombobox(false)
                            }}
                            className="cursor-pointer py-3"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedZone === zone.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{zone.name}</span>
                                <span className="font-bold text-green-600 ml-4">
                                  {zone.fixedPrice === 0 ? 'Gratis' : `$${zone.fixedPrice}`}
                                </span>
                              </div>
                              {zone.description && (
                                <p className="text-xs text-gray-600 mt-0.5">{zone.description}</p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                {zone.estimatedTime && (
                                  <span>⏱️ {zone.estimatedTime} min</span>
                                )}
                                {zone.freeDeliveryThreshold && zone.freeDeliveryThreshold > 0 && (
                                  <span className="text-green-600">
                                    Gratis en pedidos +${zone.freeDeliveryThreshold}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedZone && deliveryCalculation && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">Zona seleccionada:</span>
                    <span className="text-sm text-green-700">
                      {deliveryZones.find(z => z.id === selectedZone)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">Costo de envío:</span>
                    <span className="text-lg font-bold text-green-700">
                      {calculatedDeliveryFee === 0 ? 'Gratis' : `$${calculatedDeliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {deliveryCalculation.estimatedTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-900">Tiempo estimado:</span>
                      <span className="text-sm text-green-700">
                        {deliveryCalculation.estimatedTime} minutos
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {/* MÉTODO MANUAL */}
      {calculationMethod === 'manual' && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">Cálculo manual de envío</p>
              <p className="text-xs text-orange-700 mt-1">
                {manualDeliveryMessage || 'El costo de envío se calculará al confirmar el pedido y se te enviará por WhatsApp'}
              </p>
              <div className="mt-3 p-3 bg-orange-100 rounded-md">
                <p className="text-sm font-medium text-orange-900">💰 Envío: A calcular</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campos de dirección (común para todos los métodos) */}
      {(addressFields.street || calculationMethod === 'manual' || calculationMethod === 'zones') && (
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street" className="text-sm font-medium">Calle *</Label>
              <Input
                id="street"
                value={addressFields.street}
                onChange={(e) => setAddressFields((prev: any) => ({ ...prev, street: e.target.value }))}
                placeholder="Nombre de la calle"
                className="mt-1 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="number" className="text-sm font-medium">Número *</Label>
              <Input
                id="number"
                value={addressFields.number}
                onChange={(e) => setAddressFields((prev: any) => ({ ...prev, number: e.target.value }))}
                placeholder="123"
                className="mt-1 h-12 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="neighborhood" className="text-sm font-medium">Colonia *</Label>
              <Input
                id="neighborhood"
                value={addressFields.neighborhood}
                onChange={(e) => setAddressFields((prev: any) => ({ ...prev, neighborhood: e.target.value }))}
                placeholder="Colonia"
                className="mt-1 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="houseType" className="text-sm font-medium">Tipo de vivienda *</Label>
              <Select
                value={addressFields.houseType}
                onValueChange={(value) => setAddressFields((prev: any) => ({ ...prev, houseType: value }))}
              >
                <SelectTrigger className="mt-1 h-12 text-base">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Departamento">Departamento</SelectItem>
                  <SelectItem value="Edificio">Edificio</SelectItem>
                  <SelectItem value="Negocio">Negocio/Local</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street1" className="text-sm font-medium">Entre calles</Label>
              <Input
                id="street1"
                value={addressFields.street1}
                onChange={(e) => setAddressFields((prev: any) => ({ ...prev, street1: e.target.value }))}
                placeholder="Calle 1 y Calle 2"
                className="mt-1 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="reference" className="text-sm font-medium">Referencias</Label>
              <Input
                id="reference"
                value={addressFields.reference}
                onChange={(e) => setAddressFields((prev: any) => ({ ...prev, reference: e.target.value }))}
                placeholder="Portón verde, casa esquina, etc."
                className="mt-1 h-12 text-base"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
