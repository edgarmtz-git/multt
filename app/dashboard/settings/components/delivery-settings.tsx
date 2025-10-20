'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MapPin, Plus, Edit, Trash, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { DeliveryZoneModal } from '@/components/modals/delivery-zone-modal'

interface DeliveryZone {
  id?: string
  name: string
  type: 'FIXED'
  isActive: boolean
  order: number
  fixedPrice?: number
  freeDeliveryThreshold?: number
  estimatedTime?: number
  description?: string
  minOrderValue?: number
}

interface DeliverySettingsProps {
  settings: any
  setSettings: (settings: any) => void
  onSave?: () => void
}

export default function DeliverySettings({ settings, setSettings, onSave }: DeliverySettingsProps) {
  const [showDeliveryZoneModal, setShowDeliveryZoneModal] = useState(false)
  const [editingDeliveryZone, setEditingDeliveryZone] = useState<DeliveryZone | null>(null)
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])

  useEffect(() => {
    loadDeliveryZones()
  }, [])

  const loadDeliveryZones = async () => {
    try {
      const response = await fetch('/api/dashboard/delivery-zones')
      if (response.ok) {
        const data = await response.json()
        setDeliveryZones(data.deliveryZones || [])
      }
    } catch (error) {
      console.error('Error al cargar zonas de entrega:', error)
    }
  }

  const handleScheduleToggle = async (checked: boolean) => {
    console.log('🔍 handleScheduleToggle called with:', checked)
    console.log('🔍 onSave function:', onSave ? 'exists' : 'missing')
    
    // Actualizar estado local
    setSettings((prev: any) => ({ 
      ...prev, 
      deliveryScheduleEnabled: checked
    }))
    
    // Guardar automáticamente
    if (onSave) {
      try {
        console.log('🔍 Calling onSave...')
        await onSave()
        console.log('✅ onSave completed successfully')
      } catch (error) {
        console.error('❌ Error al guardar configuración:', error)
        // Revertir el estado si hay error
        setSettings((prev: any) => ({ 
          ...prev, 
          deliveryScheduleEnabled: !checked
        }))
      }
    } else {
      console.log('❌ onSave function not provided')
    }
  }

  const handleSaveDeliveryZone = async (zoneData: DeliveryZone) => {
    try {
      const url = zoneData.id 
        ? `/api/dashboard/delivery-zones/${zoneData.id}`
        : '/api/dashboard/delivery-zones'
      
      const method = zoneData.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneData)
      })

      if (response.ok) {
        toast.success(zoneData.id ? 'Zona actualizada correctamente' : 'Zona creada correctamente')
        loadDeliveryZones()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar la zona')
      }
    } catch (error) {
      console.error('Error al guardar zona:', error)
      toast.error('Error al guardar la zona')
    }
  }

  const handleDeleteDeliveryZone = async (zoneId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta zona de entrega?')) {
      return
    }

    try {
      const response = await fetch(`/api/dashboard/delivery-zones/${zoneId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Zona eliminada correctamente')
        loadDeliveryZones()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar la zona')
      }
    } catch (error) {
      console.error('Error al eliminar zona:', error)
      toast.error('Error al eliminar la zona')
    }
  }

  const getDeliveryTypeIcon = (type: string) => {
    return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><span className="text-green-600 font-bold text-sm">$</span></div>
  }

  const getDeliveryTypeName = (type: string) => {
    return 'Tarifa Fija'
  }

  const getDeliveryTypeDescription = (type: string) => {
    return 'Un precio único para todas las entregas'
  }

  return (
    <>
      {/* Método de cálculo de envío */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Configuración de Entregas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Activa o desactiva las entregas a domicilio y configura los costos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Switch para activar/desactivar delivery */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="deliveryEnabled" className="text-base font-medium">
                Entregas a domicilio
              </Label>
              <p className="text-sm text-muted-foreground">
                {settings.deliveryEnabled
                  ? 'Los clientes podrán elegir entre entrega a domicilio o recoger en tienda'
                  : 'Solo se mostrará la opción de recoger en tienda'}
              </p>
            </div>
            <Switch
              id="deliveryEnabled"
              checked={settings.deliveryEnabled || false}
              onCheckedChange={(checked) => {
                setSettings((prev: any) => ({
                  ...prev,
                  deliveryEnabled: checked
                }))
                // Guardar automáticamente
                if (onSave) {
                  onSave()
                }
              }}
            />
          </div>

          {/* Solo mostrar opciones de delivery si está habilitado */}
          {settings.deliveryEnabled && (
            <>
              <Separator />
              <div>
                <Label htmlFor="deliveryCalculationMethod">Método de cálculo de envío</Label>
            <Select 
              value={settings.deliveryCalculationMethod || 'distance'} 
              onValueChange={(value) => setSettings((prev: any) => ({ 
                ...prev, 
                deliveryCalculationMethod: value
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Por distancia (precio por km)</SelectItem>
                <SelectItem value="zones">Por zonas (precio fijo por zona)</SelectItem>
                <SelectItem value="manual">Manual (cálculo posterior)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              El sistema calculará automáticamente el costo según el método seleccionado
            </p>
          </div>

          {/* Indicador de método activo */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-900">
                {settings.deliveryCalculationMethod === 'distance' ? 'Cálculo por distancia activo' : 
                 settings.deliveryCalculationMethod === 'zones' ? 'Cálculo por zonas activo' : 
                 settings.deliveryCalculationMethod === 'manual' ? 'Cálculo manual activo' :
                 'Ningún método de entrega configurado'}
              </span>
            </div>
            <p className="text-sm text-green-700">
              {settings.deliveryCalculationMethod === 'distance' ? 'Se calculará el precio según la distancia desde tu tienda' :
               settings.deliveryCalculationMethod === 'zones' ? 'Se aplicarán precios según la zona de entrega configurada' :
               settings.deliveryCalculationMethod === 'manual' ? 'El cliente verá un mensaje y tú calcularás el envío manualmente' :
               'Configura un método de entrega para comenzar a recibir pedidos'}
            </p>
          </div>

          {/* Configuración por distancia */}
          {settings.deliveryCalculationMethod === 'distance' && (
            <div className="p-4 border rounded-lg bg-blue-50 space-y-4">
              <div className="text-sm font-medium text-blue-900">
                Configuración por distancia
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pricePerKm">Precio por kilómetro ($)</Label>
                  <Input
                    id="pricePerKm"
                    type="number"
                    step="0.01"
                    value={settings.pricePerKm || 0}
                    onChange={(e) => setSettings((prev: any) => ({
                      ...prev,
                      pricePerKm: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="10.00"
                  />
                </div>
                <div>
                  <Label htmlFor="minDeliveryFee">Costo mínimo ($)</Label>
                  <Input
                    id="minDeliveryFee"
                    type="number"
                    step="0.01"
                    value={settings.minDeliveryFee || 0}
                    onChange={(e) => setSettings((prev: any) => ({
                      ...prev,
                      minDeliveryFee: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="30.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Mínimo a cobrar en envíos cortos
                  </p>
                </div>
                <div>
                  <Label htmlFor="maxDeliveryDistance">Distancia máxima (km)</Label>
                  <Input
                    id="maxDeliveryDistance"
                    type="number"
                    value={settings.maxDeliveryDistance || 10}
                    onChange={(e) => setSettings((prev: any) => ({
                      ...prev,
                      maxDeliveryDistance: parseInt(e.target.value) || 10
                    }))}
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="text-xs text-blue-700">
                💡 El sistema calculará automáticamente la distancia desde tu tienda hasta la ubicación del cliente.
              </div>
            </div>
          )}

          {/* Configuración por zonas */}
          {settings.deliveryCalculationMethod === 'zones' && (
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="text-sm font-medium text-green-900 mb-2">
                Sistema por zonas activado
              </div>
              <p className="text-sm text-green-700">
                Configura las zonas de entrega en la sección "Zonas de entrega configuradas" de abajo.
                Cada zona tendrá un precio fijo independientemente de la distancia exacta.
              </p>
            </div>
          )}

          {/* Configuración manual */}
          {settings.deliveryCalculationMethod === 'manual' && (
            <div className="p-4 border rounded-lg bg-orange-50 space-y-4">
              <div className="text-sm font-medium text-orange-900">
                Configuración manual
              </div>
              <div>
                <Label htmlFor="manualDeliveryMessage">Mensaje para el cliente</Label>
                <Input
                  id="manualDeliveryMessage"
                  value={settings.manualDeliveryMessage || 'El costo de envío se calculará al confirmar el pedido y se te enviará por WhatsApp.'}
                  onChange={(e) => setSettings((prev: any) => ({ 
                    ...prev, 
                    manualDeliveryMessage: e.target.value 
                  }))}
                  placeholder="Mensaje que verá el cliente sobre el cálculo de envío"
                />
              </div>
              <div className="text-xs text-orange-700">
                💡 El cliente verá este mensaje y tú podrás calcular el envío manualmente después de recibir el pedido.
              </div>
            </div>
          )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Zonas de entrega configuradas - Solo visible si delivery está habilitado Y el método es 'zones' */}
      {settings.deliveryEnabled && settings.deliveryCalculationMethod === 'zones' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Zonas de entrega configuradas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {deliveryZones.length === 0 
                ? 'No tienes zonas de entrega configuradas. Crea tu primera zona de entrega.'
                : `${deliveryZones.length} zona${deliveryZones.length !== 1 ? 's' : ''} de entrega configurada${deliveryZones.length !== 1 ? 's' : ''}`
              }
            </p>
          </CardHeader>
        <CardContent>
          {deliveryZones.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No hay zonas de entrega</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configura tu primer método de entrega para comenzar a recibir pedidos
              </p>
              <Button 
                onClick={() => {
                  const newZone: DeliveryZone = {
                    name: 'Nueva Zona',
                    type: 'FIXED',
                    isActive: true,
                    order: deliveryZones.length,
                    fixedPrice: 0,
                    freeDeliveryThreshold: 0,
                    estimatedTime: 30,
                    description: '',
                    minOrderValue: 0
                  }
                  setEditingDeliveryZone(newZone)
                  setShowDeliveryZoneModal(true)
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primera zona
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveryZones.map((zone) => (
                <Card key={zone.id} className={`transition-all duration-200 ${zone.isActive ? 'border-border' : 'border-muted bg-muted/30'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getDeliveryTypeIcon(zone.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{zone.name}</h3>
                            {!zone.isActive && (
                              <Badge variant="secondary" className="text-xs">Inactiva</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getDeliveryTypeName(zone.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {getDeliveryTypeDescription(zone.type)}
                          </p>
                          
                          {/* Detalles específicos por tipo */}
                          <div className="text-xs text-muted-foreground">
                            {zone.type === 'FIXED' && zone.fixedPrice && (
                              <span>Precio fijo: ${zone.fixedPrice}</span>
                            )}
                            {zone.estimatedTime && (
                              <span className="ml-2">• Tiempo: {zone.estimatedTime}min</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingDeliveryZone(zone)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => zone.id && handleDeleteDeliveryZone(zone.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Botón para agregar nueva zona */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => {
                    const newZone: DeliveryZone = {
                      name: 'Nueva Zona',
                      type: 'FIXED',
                      isActive: true,
                      order: deliveryZones.length,
                      fixedPrice: 0,
                      freeDeliveryThreshold: 0,
                      estimatedTime: 30,
                      description: '',
                      minOrderValue: 0
                    }
                    setEditingDeliveryZone(newZone)
                    setShowDeliveryZoneModal(true)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar nueva zona de entrega
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Horarios de entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios de entrega
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura cuándo los clientes pueden recibir sus pedidos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Habilitar horarios de entrega</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que los clientes elijan fecha y hora de entrega
              </p>
            </div>
            <Switch 
              checked={settings.deliveryScheduleEnabled || false}
              onCheckedChange={handleScheduleToggle}
            />
          </div>

          {settings.deliveryScheduleEnabled && (
            <div className="p-4 border rounded-lg bg-blue-50 space-y-4">
              <div className="text-sm font-medium text-blue-900">
                Configuración de horarios
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduleType">Tipo de selector</Label>
                  <Select 
                    value={settings.scheduleType || 'date'} 
                    onValueChange={(value) => setSettings((prev: any) => ({ 
                      ...prev, 
                      scheduleType: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Solo fecha</SelectItem>
                      <SelectItem value="datetime">Fecha y hora (30 min)</SelectItem>
                      <SelectItem value="timeslots">Fecha y franjas horarias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="advanceDays">Días de anticipación</Label>
                  <Input
                    id="advanceDays"
                    type="number"
                    value={settings.advanceDays || 1}
                    onChange={(e) => setSettings((prev: any) => ({ 
                      ...prev, 
                      advanceDays: parseInt(e.target.value) || 1 
                    }))}
                    placeholder="1"
                    min="1"
                    max="30"
                  />
                </div>
              </div>
              
              <div className="text-xs text-blue-700">
                💡 Los clientes podrán elegir cuándo recibir su pedido según el tipo de selector configurado.
              </div>
            </div>
          )}

          <Separator />

          {/* Horarios de servicio */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground">
              Horarios de servicio
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="text-sm font-medium text-gray-900 mb-3">
                Configura los días y horarios de servicio
              </div>
              
              <div className="space-y-3">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        defaultChecked 
                        id={`day-${index}`}
                      />
                      <Label htmlFor={`day-${index}`} className="font-medium">
                        {day}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        defaultValue="09:00" 
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">a</span>
                      <Input 
                        type="time" 
                        defaultValue="18:00" 
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-600 mt-3">
                💡 Desmarca los días que no están incluidos en el horario semanal.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de zona de entrega */}
      <DeliveryZoneModal
        isOpen={showDeliveryZoneModal}
        onClose={() => setShowDeliveryZoneModal(false)}
        onSave={handleSaveDeliveryZone}
        initialData={editingDeliveryZone || undefined}
      />
    </>
  )
}
