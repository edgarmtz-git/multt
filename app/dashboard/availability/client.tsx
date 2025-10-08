'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  Settings,
  AlertTriangle,
  Truck
} from 'lucide-react'
import { ScheduleEditor } from '@/components/schedule/schedule-editor'
import { toast } from 'sonner'

interface TimePeriod {
  open: string
  close: string
}

interface DaySchedule {
  isOpen: boolean
  periods: TimePeriod[]
}

interface UnifiedSchedule {
  operatingHours: {
    monday: DaySchedule
    tuesday: DaySchedule
    wednesday: DaySchedule
    thursday: DaySchedule
    friday: DaySchedule
    saturday: DaySchedule
    sunday: DaySchedule
  }
  deliveryOptions: {
    enabled: boolean
    immediate: boolean
    scheduled: boolean
    pickup: boolean
    minAdvanceHours: number
    maxAdvanceDays: number
    useOperatingHours: boolean
  }
  exceptions: any[]
}

interface AvailabilityPageClientProps {
  initialSchedule: UnifiedSchedule
}

export function AvailabilityPageClient({ initialSchedule }: AvailabilityPageClientProps) {
  const [schedule, setSchedule] = useState<UnifiedSchedule>(initialSchedule)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async (newSchedule: UnifiedSchedule) => {
    try {
      const response = await fetch('/api/dashboard/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unifiedSchedule: newSchedule
        })
      })

      if (!response.ok) {
        throw new Error('Error al guardar horarios')
      }

      setSchedule(newSchedule)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving schedule:', error)
      throw error
    }
  }

  // Verificar estado actual
  const now = new Date()
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()] as keyof typeof schedule.operatingHours
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  const todayConfig = schedule?.operatingHours?.[currentDay]
  let isCurrentlyOpen = false
  let currentPeriod = null
  
  if (todayConfig && todayConfig.isOpen) {
    for (const period of todayConfig.periods) {
      const [openHour, openMin] = period.open.split(':').map(Number)
      const [closeHour, closeMin] = period.close.split(':').map(Number)
      const openTime = openHour * 60 + openMin
      const closeTime = closeHour * 60 + closeMin
      
      if (currentTime >= openTime && currentTime <= closeTime) {
        isCurrentlyOpen = true
        currentPeriod = period
        break
      }
    }
  }

  const days = [
    { key: 'monday', name: 'Lunes' },
    { key: 'tuesday', name: 'Martes' },
    { key: 'wednesday', name: 'Miércoles' },
    { key: 'thursday', name: 'Jueves' },
    { key: 'friday', name: 'Viernes' },
    { key: 'saturday', name: 'Sábado' },
    { key: 'sunday', name: 'Domingo' }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Disponibilidad</h2>
            <p className="text-muted-foreground">
              Sistema unificado de horarios comerciales y de entrega
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isCurrentlyOpen ? "default" : "secondary"}>
              {isCurrentlyOpen ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Abierto
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Cerrado
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Estado Actual del Negocio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Estado Actual</p>
                  <p className="text-sm text-muted-foreground">
                    {isCurrentlyOpen 
                      ? "Tu negocio está abierto y recibiendo pedidos" 
                      : "Tu negocio está cerrado"
                    }
                  </p>
                </div>
                <Badge variant={isCurrentlyOpen ? "default" : "secondary"}>
                  {isCurrentlyOpen ? "Abierto" : "Cerrado"}
                </Badge>
              </div>
              
              {isCurrentlyOpen && currentPeriod && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Horario actual:</strong> {currentPeriod.open} - {currentPeriod.close}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Horarios</p>
                  <p className="text-xs text-muted-foreground">Configurados</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Entregas</p>
                  <p className="text-xs text-muted-foreground">
                    {schedule?.deliveryOptions?.enabled ? "Habilitadas" : "Deshabilitadas"}
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">Programación</p>
                  <p className="text-xs text-muted-foreground">
                    {schedule?.deliveryOptions?.scheduled ? "Disponible" : "No disponible"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios Comerciales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {days.map((day) => {
                const dayData = schedule?.operatingHours?.[day.key as keyof typeof schedule.operatingHours]
                return (
                  <div key={day.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-sm font-medium">{day.name}</div>
                      <Badge variant={dayData?.isOpen ? "default" : "secondary"}>
                        {dayData?.isOpen ? "Abierto" : "Cerrado"}
                      </Badge>
                    </div>
                    
                    {dayData?.isOpen ? (
                      <div className="flex items-center gap-2 text-sm">
                        {dayData?.periods?.map((period: any, index: number) => (
                          <span key={index} className="bg-blue-50 px-2 py-1 rounded text-blue-800">
                            {period.open} - {period.close}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="secondary">Cerrado</Badge>
                    )}
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Ver Horarios' : 'Editar Horarios'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Editor */}
        {isEditing && (
          <ScheduleEditor 
            initialSchedule={schedule} 
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  )
}
