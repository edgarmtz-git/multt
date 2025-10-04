'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import SettingsLayout from './components/settings-layout'

interface StoreSettings {
  id?: string
  storeName: string
  storeSlug: string
  email?: string
  address?: any
  country: string
  language: string
  currency: string
  distanceUnit: string
  taxRate: number
  taxMethod: string
  enableBusinessHours: boolean
  disableCheckoutOutsideHours: boolean
  deliveryEnabled: boolean
  useBasePrice: boolean
  baseDeliveryPrice?: number
  baseDeliveryThreshold?: number
  paymentsEnabled: boolean
  storeActive: boolean
  passwordProtected: boolean
  accessPassword?: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Mi Tienda',
    storeSlug: '',
    country: 'Mexico',
    language: 'es',
    currency: 'MXN',
    distanceUnit: 'km',
    taxRate: 0.0,
    taxMethod: 'included',
    enableBusinessHours: false,
    disableCheckoutOutsideHours: false,
    deliveryEnabled: false,
    useBasePrice: false,
    baseDeliveryPrice: 0,
    baseDeliveryThreshold: 0,
    paymentsEnabled: true,
    storeActive: true,
    passwordProtected: false
  })

  useEffect(() => {
    loadSettings()
    loadDeliveryZones()
    // Detectar dominio automáticamente
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname + (window.location.port ? `:${window.location.port}` : ''))
    }
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

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

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Configuración guardada')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleAddressSave = async (address: AddressData) => {
    try {
      // Actualizar el estado local
      setSettings(prev => ({ ...prev, address }))
      
      // Guardar automáticamente en la base de datos
      const response = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          address
        })
      })

      if (response.ok) {
        toast.success('Dirección guardada correctamente')
      } else {
        toast.error('Error al guardar la dirección')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Error al guardar la dirección')
    }
  }

  const handleAddressDelete = async () => {
    try {
      // Actualizar el estado local
      setSettings(prev => ({ ...prev, address: undefined }))
      
      // Guardar automáticamente en la base de datos
      const response = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          address: undefined
        })
      })

      if (response.ok) {
        toast.success('Dirección eliminada correctamente')
      } else {
        toast.error('Error al eliminar la dirección')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Error al eliminar la dirección')
    }
  }

  // Funciones para zonas de entrega
  const handleCreateDeliveryZone = () => {
    setEditingDeliveryZone(null)
    setShowDeliveryZoneModal(true)
  }

  const handleEditDeliveryZone = (zone: DeliveryZone) => {
    setEditingDeliveryZone(zone)
    setShowDeliveryZoneModal(true)
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

  const formatAddress = (address: AddressData) => {
    return address.address
  }

  const handleBusinessHoursChange = (day: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: enabled ? [{ open: '09:00', close: '18:00' }] : []
      }
    }))
  }

  const addTimeSlot = (day: string) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: [
          ...(prev.businessHours?.[day] || []),
          { open: '09:00', close: '18:00' }
        ]
      }
    }))
  }

  const removeTimeSlot = (day: string, index: number) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: prev.businessHours?.[day]?.filter((_, i) => i !== index) || []
      }
    }))
  }

  const updateTimeSlot = (day: string, index: number, field: 'open' | 'close', value: string) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: prev.businessHours?.[day]?.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        ) || []
      }
    }))
  }

  if (loading) {
  return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-8 text-muted-foreground">
            Cargando configuración...
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">Gestiona la configuración de tu tienda</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="business-hours">Horario Comercial</TabsTrigger>
            <TabsTrigger value="communities">Comunidades</TabsTrigger>
            <TabsTrigger value="deliveries">Entregas</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
          </TabsList>

          {/* Configuración General */}
          <TabsContent value="general" className="space-y-6">
            {/* Perfil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campos principales en una línea */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="storeName">Nombre de la tienda</Label>
                    <Input
                      id="storeName"
                      value={settings.storeName}
                      onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={settings.email || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tienda@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeSlug">Enlace de la tienda</Label>
                    <div className="flex">
                      <span className="inline-flex items-center pl-3 pr-1 h-10 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
                        {domain}/tienda/
                      </span>
                      <span className="inline-flex items-center pl-1 pr-3 h-10 text-sm text-muted-foreground bg-muted border border-l-0 border-input rounded-r-md">
                        {settings.storeSlug}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      🔒 La URL de tu tienda se genera automáticamente por seguridad
                    </p>
                  </div>
                </div>

                {/* Sección de dirección con mapa */}
                <div>
                  <Label>Dirección</Label>
                  {settings.address ? (
                    <div className="space-y-4">
                      {/* Mapa simple */}
                      <SimpleMap
                        address={formatAddress(settings.address)}
                        latitude={settings.address.latitude}
                        longitude={settings.address.longitude}
                        googleMapsUrl={settings.address.googleMapsUrl}
                        height="250px"
                        className="border-2 border-dashed border-gray-300"
                      />

                      {/* Dirección formateada */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">{formatAddress(settings.address)}</p>
                        {settings.address.latitude && settings.address.longitude && (
                          <p className="text-xs text-gray-500 mt-1">
                            Coordenadas: {settings.address.latitude.toFixed(6)}, {settings.address.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddressModal(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleAddressDelete}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Borrar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddressModal(true)}
                      className="w-full h-32 justify-center flex-col"
                    >
                      <MapPin className="h-8 w-8 mb-2" />
                      <span>Introduzca la dirección</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Número de WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="whatsappMain">Número principal</Label>
                  <Input 
                    id="whatsappMain"
                    value={settings.whatsappMainNumber || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsappMainNumber: e.target.value }))}
                    placeholder="+52 1234567890"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuración Regional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">País/Región</Label>
                    <Select value={settings.country} onValueChange={(value) => setSettings(prev => ({ ...prev, country: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mexico">México</SelectItem>
                        <SelectItem value="US">Estados Unidos</SelectItem>
                        <SelectItem value="CA">Canadá</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                        <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                        <SelectItem value="CAD">CAD - Dólar Canadiense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="distanceUnit">Unidad de distancia</Label>
                    <Select value={settings.distanceUnit} onValueChange={(value) => setSettings(prev => ({ ...prev, distanceUnit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">Kilómetro</SelectItem>
                        <SelectItem value="mi">Millas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impuestos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Tasa de impuestos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxRate">Tasa de impuestos (%)</Label>
                    <Input 
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={settings.taxRate}
                      onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>Método de impuesto</Label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="taxMethod"
                          value="included"
                          checked={settings.taxMethod === 'included'}
                          onChange={(e) => setSettings(prev => ({ ...prev, taxMethod: e.target.value }))}
                        />
                        <span>Impuestos incluidos</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="taxMethod"
                          value="excluded"
                          checked={settings.taxMethod === 'excluded'}
                          onChange={(e) => setSettings(prev => ({ ...prev, taxMethod: e.target.value }))}
                        />
                        <span>Impuestos excluidos</span>
                      </label>
                  </div>
                </div>
                </div>
                <div>
                  <Label htmlFor="tagId">ID de la etiqueta</Label>
                    <Input 
                    id="tagId"
                    value={settings.tagId || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, tagId: e.target.value }))}
                    placeholder="Para analytics o integraciones"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Horario Comercial */}
          <TabsContent value="business-hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horario comercial
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Los clientes pueden ver el estado "Abierto" o "Cerrado" en tu tienda.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Toggle principal */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Activar horario comercial</Label>
                    <p className="text-sm text-muted-foreground">
                      Configura los horarios de apertura y cierre de tu tienda
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableBusinessHours}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableBusinessHours: checked }))}
                  />
                  </div>
                  
                {settings.enableBusinessHours && (
                  <>
                    <Separator />
                    
                    {/* Grid de días */}
                    <div className="grid gap-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Configurar horarios por día
                      </div>
                      
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const dayNames = {
                          monday: 'Lunes',
                          tuesday: 'Martes',
                          wednesday: 'Miércoles',
                          thursday: 'Jueves',
                          friday: 'Viernes',
                          saturday: 'Sábado',
                          sunday: 'Domingo'
                        }
                        const dayHours = settings.businessHours?.[day] || []
                        const isEnabled = dayHours.length > 0

                        return (
                          <Card key={day} className={`transition-all duration-200 ${isEnabled ? 'border-primary/20 bg-primary/5' : 'border-border'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => handleBusinessHoursChange(day, checked)}
                                  />
                                  <Label className="font-medium text-base cursor-pointer">
                                    {dayNames[day as keyof typeof dayNames]}
                                  </Label>
                                </div>
                                {isEnabled && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addTimeSlot(day)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {isEnabled && (
                                <div className="space-y-3">
                                  {dayHours.map((slot, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-background border rounded-lg">
                                      <div className="flex items-center space-x-2">
                    <Input 
                                          type="time"
                                          value={slot.open}
                                          onChange={(e) => updateTimeSlot(day, index, 'open', e.target.value)}
                                          className="w-28 h-9"
                                        />
                                        <span className="text-muted-foreground font-medium">a</span>
                                        <Input
                                          type="time"
                                          value={slot.close}
                                          onChange={(e) => updateTimeSlot(day, index, 'close', e.target.value)}
                                          className="w-28 h-9"
                    />
                  </div>
                                      {dayHours.length > 1 && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => removeTimeSlot(day, index)}
                                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                </div>
                                  ))}
                                  {dayHours.length === 0 && (
                                    <div className="text-center py-4 text-muted-foreground text-sm">
                                      Agrega un horario para este día
                                    </div>
                                  )}
                                </div>
                              )}

                              {!isEnabled && (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                  Este día está cerrado
                                </div>
                              )}
              </CardContent>
            </Card>
                        )
                      })}
                    </div>

                    <Separator />

                    {/* Configuración adicional */}
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Configuración adicional
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Deshabilitar finalizar compra fuera de horario</Label>
                          <p className="text-sm text-muted-foreground">
                            Los clientes no pueden realizar pedidos fuera del horario de apertura
                          </p>
                        </div>
                        <Switch
                          checked={settings.disableCheckoutOutsideHours}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, disableCheckoutOutsideHours: checked }))}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comunidades */}
          <TabsContent value="communities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Comunidades
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Muestra tu comunidad en línea en tu tienda
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
                  <Label htmlFor="whatsappCommunity">WhatsApp</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                      https://
                    </span>
                    <Input 
                      id="whatsappCommunity"
                      value={settings.whatsappCommunityLink || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, whatsappCommunityLink: e.target.value }))}
                      placeholder="Enlace del grupo, comunidad o canal"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="telegramCommunity">Telegram</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                      https://
                    </span>
                    <Input 
                      id="telegramCommunity"
                      value={settings.telegramCommunityLink || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, telegramCommunityLink: e.target.value }))}
                      placeholder="Enlace del grupo o canal"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="instagramCommunity">Instagram</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                      https://
                    </span>
                    <Input 
                      id="instagramCommunity"
                      value={settings.instagramLink || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, instagramLink: e.target.value }))}
                      placeholder="Enlace del grupo, canal o perfil"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="facebookCommunity">Facebook</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                      https://
                    </span>
                    <Input 
                      id="facebookCommunity"
                      value={settings.facebookLink || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, facebookLink: e.target.value }))}
                      placeholder="Enlace del grupo o página"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entregas */}
          <TabsContent value="deliveries" className="space-y-6">
            {/* Métodos de entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Métodos de entrega
                </CardTitle>
                    <p className="text-sm text-muted-foreground">
                  Configura cómo calculas los costos de entrega para tus clientes
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Indicador de método activo */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-900">
                      {settings.useBasePrice ? 'Precio base activo' : 
                       settings.deliveryEnabled ? 'Zonas de entrega activas' : 
                       'Ningún método de entrega configurado'}
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    {settings.useBasePrice ? 'Se aplicará un precio fijo a todas las entregas' :
                     settings.deliveryEnabled ? 'Se aplicarán precios según la zona de entrega' :
                     'Configura un método de entrega para comenzar a recibir pedidos'}
                  </p>
                </div>

                {/* Switch para habilitar entregas por zonas */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Habilitar entregas por zonas</Label>
                    <p className="text-sm text-muted-foreground">
                      Configura diferentes precios según la zona de entrega
                    </p>
                  </div>
                  <Switch 
                    checked={settings.deliveryEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ 
                      ...prev, 
                      deliveryEnabled: checked,
                      // Si se activan zonas, desactivar precio base
                      useBasePrice: checked ? false : prev.useBasePrice
                    }))}
                  />
                </div>

                {/* Información sobre zonas de entrega */}
                {settings.deliveryEnabled && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">$</span>
                    </div>
                      <div>
                        <h4 className="font-medium text-blue-900">Zonas de Entrega con Precio Fijo</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Configura zonas de entrega con un precio fijo para cada una. 
                          Ideal para negocios que quieren mantener la simplicidad.
                        </p>
                  </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Zonas de entrega configuradas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Zonas de entrega configuradas
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {deliveryZones.length === 0 
                    ? 'No tienes zonas de entrega configuradas. Crea tu primer método de entrega arriba.'
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
                                onClick={() => handleEditDeliveryZone(zone)}
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

            {/* Configuración general de entregas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Configuración general
                </CardTitle>
                    <p className="text-sm text-muted-foreground">
                  Opciones adicionales para la gestión de entregas
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sistema de precios de entrega */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Sistema de precios de entrega
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Usar precio base</Label>
                        <p className="text-sm text-muted-foreground">
                          Un precio único para todas las entregas (más simple)
                        </p>
                      </div>
                      <Switch 
                        checked={settings.useBasePrice}
                        onCheckedChange={(checked) => setSettings(prev => ({ 
                          ...prev, 
                          useBasePrice: checked,
                          // Si se activa precio base, desactivar zonas
                          deliveryEnabled: checked ? false : prev.deliveryEnabled
                        }))}
                      />
                    </div>

                    {settings.useBasePrice ? (
                      <div className="p-4 border rounded-lg bg-blue-50 space-y-4">
                        <div className="text-sm font-medium text-blue-900">
                          Configuración de precio base
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="baseDeliveryPrice">Precio base de entrega ($)</Label>
                            <Input
                              id="baseDeliveryPrice"
                              type="number"
                              step="0.01"
                              value={settings.baseDeliveryPrice || 0}
                              onChange={(e) => setSettings(prev => ({ 
                                ...prev, 
                                baseDeliveryPrice: parseFloat(e.target.value) || 0 
                              }))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="baseDeliveryThreshold">Monto mínimo para entrega gratuita ($)</Label>
                            <Input
                              id="baseDeliveryThreshold"
                              type="number"
                              step="0.01"
                              value={settings.baseDeliveryThreshold || 0}
                              onChange={(e) => setSettings(prev => ({ 
                                ...prev, 
                                baseDeliveryThreshold: parseFloat(e.target.value) || 0 
                              }))}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-blue-700">
                          💡 Con precio base, todas las entregas costarán lo mismo, independientemente de la ubicación.
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg bg-green-50">
                        <div className="text-sm font-medium text-green-900 mb-2">
                          Sistema por zonas activado
                        </div>
                        <p className="text-sm text-green-700">
                          Puedes crear diferentes zonas de entrega con precios específicos para cada una.
                          Las zonas se configuran en la sección "Zonas de entrega configuradas" de arriba.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Opciones de entrega */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Opciones de entrega
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Entrega a domicilio</Label>
                        <p className="text-sm text-muted-foreground">
                          Permitir entregas a domicilio
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Recogida en tienda</Label>
                    <p className="text-sm text-muted-foreground">
                          Permitir que los clientes recojan en tienda
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Entrega programada</Label>
                    <p className="text-sm text-muted-foreground">
                          Permitir programar entregas para fechas específicas
                    </p>
                  </div>
                  <Switch />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tiempos de entrega */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Tiempos de entrega
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryTime">Tiempo promedio de entrega (minutos)</Label>
                      <Input
                        id="deliveryTime"
                        type="number"
                        placeholder="30"
                        defaultValue="30"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDeliveryTime">Tiempo máximo de entrega (minutos)</Label>
                      <Input
                        id="maxDeliveryTime"
                        type="number"
                        placeholder="60"
                        defaultValue="60"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagos */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configuración de pagos
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Configura los métodos de pago disponibles para tus clientes
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Métodos de pago */}
                <div>
                  <Label className="text-base font-medium">Métodos de pago</Label>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-green-600 font-bold">$</span>
                        </div>
                        <div>
                          <p className="font-medium">Efectivo</p>
                          <p className="text-sm text-gray-600">Pago en efectivo al recibir</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 font-bold">💳</span>
                        </div>
                        <div>
                          <p className="font-medium">Tarjeta de crédito/débito</p>
                          <p className="text-sm text-gray-600">Pago con tarjeta</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-green-600 font-bold">📱</span>
                        </div>
                        <div>
                          <p className="font-medium">Transferencia bancaria</p>
                          <p className="text-sm text-gray-600">Pago por transferencia</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-green-600 font-bold">📲</span>
                        </div>
                        <div>
                          <p className="font-medium">WhatsApp Pay</p>
                          <p className="text-sm text-gray-600">Pago a través de WhatsApp</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                {/* Configuración de pagos */}
                <div>
                  <Label className="text-base font-medium">Configuración de pagos</Label>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pagos en línea</p>
                        <p className="text-sm text-gray-600">Habilitar pagos en línea</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pago contra entrega</p>
                        <p className="text-sm text-gray-600">Permitir pago al recibir el pedido</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Anticipo requerido</p>
                        <p className="text-sm text-gray-600">Solicitar anticipo del 50%</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                {/* Información bancaria */}
                <div>
                  <Label className="text-base font-medium">Información bancaria</Label>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="bankName">Nombre del banco</Label>
                      <Input
                        id="bankName"
                        placeholder="BBVA Bancomer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Número de cuenta</Label>
                      <Input
                        id="accountNumber"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clabe">CLABE</Label>
                      <Input
                        id="clabe"
                        placeholder="012345678901234567"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seguridad */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuración de seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Deshabilitar pago</Label>
                    <p className="text-sm text-muted-foreground">
                      Los puntos de entrada para finalizar la compra se deshabilitarán y los clientes no podrán hacer más pedidos
                    </p>
                  </div>
                  <Switch
                    checked={!settings.paymentsEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, paymentsEnabled: !checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Deshabilitar tienda</Label>
                    <p className="text-sm text-muted-foreground">
                      La tienda se desactivará y todos los visitantes serán redirigidos a WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={!settings.storeActive}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, storeActive: !checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Proteger tienda con contraseña</Label>
                    <p className="text-sm text-muted-foreground">
                      Limita quién puede acceder a tu tienda en línea
                    </p>
                  </div>
                  <Switch
                    checked={settings.passwordProtected}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, passwordProtected: checked }))}
                  />
                </div>

                {settings.passwordProtected && (
                  <div>
                    <Label htmlFor="accessPassword">Contraseña de acceso</Label>
                  <Input 
                      id="accessPassword"
                    type="password"
                      value={settings.accessPassword || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, accessPassword: e.target.value }))}
                      placeholder="Ingresa la contraseña"
                  />
                </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Zona de peligro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">⚠️ <strong>Peligro:</strong></p>
                  <p>Pedidos, productos, clientes y todos los demás ajustes relacionados con la tienda se eliminarán permanentemente.</p>
                </div>
                <Button variant="destructive" className="mt-4" disabled>
                  Eliminar tienda
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de dirección */}
        <SimpleAddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSave={handleAddressSave}
          initialAddress={settings.address}
        />

        {/* Modal de zona de entrega */}
        <DeliveryZoneModal
          isOpen={showDeliveryZoneModal}
          onClose={() => setShowDeliveryZoneModal(false)}
          onSave={handleSaveDeliveryZone}
          initialData={editingDeliveryZone || undefined}
        />
      </div>
    </DashboardLayout>
  )
}