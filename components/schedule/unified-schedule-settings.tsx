'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Clock, Truck, Calendar, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface OperatingHours {
  [day: string]: {
    isOpen: boolean
    periods: Array<{ open: string, close: string }>
  }
}

interface DeliveryOptions {
  enabled: boolean
  immediate: boolean
  scheduled: boolean
  pickup: boolean
  minAdvanceHours: number
  maxAdvanceDays: number
  useOperatingHours: boolean
}

interface UnifiedSchedule {
  operatingHours: OperatingHours
  deliveryOptions: DeliveryOptions
  exceptions: Array<{
    date: string
    isOpen: boolean
    reason: string
    customHours?: Array<{ open: string, close: string }>
  }>
}

interface UnifiedScheduleSettingsProps {
  schedule: UnifiedSchedule | null
  onSave: (schedule: UnifiedSchedule) => void
  loading?: boolean
}

export default function UnifiedScheduleSettings({ 
  schedule, 
  onSave, 
  loading = false 
}: UnifiedScheduleSettingsProps) {
  const [localSchedule, setLocalSchedule] = useState<UnifiedSchedule>({
    operatingHours: {
      monday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
      tuesday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
      wednesday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
      thursday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
      friday: { isOpen: true, periods: [{ open: "09:00", close: "23:00" }] },
      saturday: { isOpen: true, periods: [{ open: "10:00", close: "23:00" }] },
      sunday: { isOpen: true, periods: [{ open: "11:00", close: "21:00" }] }
    },
    deliveryOptions: {
      enabled: true,
      immediate: true,
      scheduled: true,
      pickup: true,
      minAdvanceHours: 1,
      maxAdvanceDays: 7,
      useOperatingHours: true
    },
    exceptions: []
  })

  useEffect(() => {
    if (schedule) {
      setLocalSchedule(schedule)
    }
  }, [schedule])

  const days = [
    { key: 'monday', name: 'Lunes' },
    { key: 'tuesday', name: 'Martes' },
    { key: 'wednesday', name: 'Miércoles' },
    { key: 'thursday', name: 'Jueves' },
    { key: 'friday', name: 'Viernes' },
    { key: 'saturday', name: 'Sábado' },
    { key: 'sunday', name: 'Domingo' }
  ]

  const handleOperatingHoursChange = (day: string, isOpen: boolean) => {
    setLocalSchedule(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          isOpen
        }
      }
    }))
  }

  const handlePeriodChange = (day: string, periodIndex: number, field: 'open' | 'close', value: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          periods: prev.operatingHours[day].periods.map((period, index) => 
            index === periodIndex ? { ...period, [field]: value } : period
          )
        }
      }
    }))
  }

  const handleDeliveryOptionChange = (option: keyof DeliveryOptions, value: boolean | number) => {
    setLocalSchedule(prev => ({
      ...prev,
      deliveryOptions: {
        ...prev.deliveryOptions,
        [option]: value
      }
    }))
  }

  const handleSave = () => {
    onSave(localSchedule)
    toast.success('Configuración de horarios guardada')
  }

  return (
    <div className="space-y-6">
      {/* Horarios de operación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios de Operación
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura cuándo está abierto tu negocio
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map(day => {
            const dayConfig = localSchedule.operatingHours[day.key]
            return (
              <div key={day.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium">{day.name}</div>
                  <Switch 
                    checked={dayConfig.isOpen}
                    onCheckedChange={(checked) => handleOperatingHoursChange(day.key, checked)}
                  />
                </div>
                
                {dayConfig.isOpen ? (
                  <div className="flex items-center gap-2">
                    {dayConfig.periods.map((period, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={period.open}
                          onChange={(e) => handlePeriodChange(day.key, index, 'open', e.target.value)}
                          className="w-24"
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={period.close}
                          onChange={(e) => handlePeriodChange(day.key, index, 'close', e.target.value)}
                          className="w-24"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Badge variant="secondary">Cerrado</Badge>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Opciones de entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Opciones de Entrega
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura cómo y cuándo se pueden entregar los pedidos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Habilitar entregas */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Habilitar entregas</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que los clientes soliciten entregas
              </p>
            </div>
            <Switch 
              checked={localSchedule.deliveryOptions.enabled}
              onCheckedChange={(checked) => handleDeliveryOptionChange('enabled', checked)}
            />
          </div>

          {localSchedule.deliveryOptions.enabled && (
            <>
              {/* Tipos de entrega */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Tipos de entrega disponibles</Label>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Entrega inmediata</Label>
                    <p className="text-sm text-muted-foreground">
                      Entregar dentro del horario de operación
                    </p>
                  </div>
                  <Switch 
                    checked={localSchedule.deliveryOptions.immediate}
                    onCheckedChange={(checked) => handleDeliveryOptionChange('immediate', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Entrega programada</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir programar entregas para fechas futuras
                    </p>
                  </div>
                  <Switch 
                    checked={localSchedule.deliveryOptions.scheduled}
                    onCheckedChange={(checked) => handleDeliveryOptionChange('scheduled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Recogida en tienda</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que los clientes recojan en tienda
                    </p>
                  </div>
                  <Switch 
                    checked={localSchedule.deliveryOptions.pickup}
                    onCheckedChange={(checked) => handleDeliveryOptionChange('pickup', checked)}
                  />
                </div>
              </div>

              {/* Configuración de anticipación */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Configuración de anticipación</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAdvanceHours">Tiempo mínimo de anticipación (horas)</Label>
                    <Input
                      id="minAdvanceHours"
                      type="number"
                      min="0"
                      max="24"
                      value={localSchedule.deliveryOptions.minAdvanceHours}
                      onChange={(e) => handleDeliveryOptionChange('minAdvanceHours', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAdvanceDays">Tiempo máximo de anticipación (días)</Label>
                    <Input
                      id="maxAdvanceDays"
                      type="number"
                      min="1"
                      max="30"
                      value={localSchedule.deliveryOptions.maxAdvanceDays}
                      onChange={(e) => handleDeliveryOptionChange('maxAdvanceDays', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>

              {/* Usar horarios de operación */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Usar horarios de operación</Label>
                  <p className="text-sm text-muted-foreground">
                    Las entregas solo estarán disponibles durante el horario de operación
                  </p>
                </div>
                <Switch 
                  checked={localSchedule.deliveryOptions.useOperatingHours}
                  onCheckedChange={(checked) => handleDeliveryOptionChange('useOperatingHours', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Settings className="h-4 w-4 mr-2" />
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  )
}
