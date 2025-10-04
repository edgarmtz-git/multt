'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Clock, Plus, Trash2, Save } from 'lucide-react'
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

interface ScheduleEditorProps {
  initialSchedule: UnifiedSchedule
  onSave: (schedule: UnifiedSchedule) => Promise<void>
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

export function ScheduleEditor({ initialSchedule, onSave }: ScheduleEditorProps) {
  const [schedule, setSchedule] = useState<UnifiedSchedule>(initialSchedule)
  const [saving, setSaving] = useState(false)

  const updateDaySchedule = (day: string, updates: Partial<DaySchedule>) => {
    setSchedule(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          ...updates
        }
      }
    }))
  }

  const addPeriod = (day: string) => {
    updateDaySchedule(day, {
      periods: [
        ...schedule.operatingHours[day as keyof typeof schedule.operatingHours].periods,
        { open: '09:00', close: '17:00' }
      ]
    })
  }

  const removePeriod = (day: string, index: number) => {
    const daySchedule = schedule.operatingHours[day as keyof typeof schedule.operatingHours]
    updateDaySchedule(day, {
      periods: daySchedule.periods.filter((_, i) => i !== index)
    })
  }

  const updatePeriod = (day: string, index: number, field: 'open' | 'close', value: string) => {
    const daySchedule = schedule.operatingHours[day as keyof typeof schedule.operatingHours]
    const newPeriods = [...daySchedule.periods]
    newPeriods[index] = { ...newPeriods[index], [field]: value }
    updateDaySchedule(day, { periods: newPeriods })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(schedule)
      toast.success('Horarios guardados exitosamente')
    } catch (error) {
      console.error('Error saving schedule:', error)
      toast.error('Error al guardar horarios')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
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
              const dayData = schedule.operatingHours[day.key as keyof typeof schedule.operatingHours]
              return (
                <div key={day.key} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-sm font-medium">{day.name}</div>
                      <Switch
                        checked={dayData.isOpen}
                        onCheckedChange={(checked) => updateDaySchedule(day.key, { isOpen: checked })}
                      />
                      <Badge variant={dayData.isOpen ? "default" : "secondary"}>
                        {dayData.isOpen ? "Abierto" : "Cerrado"}
                      </Badge>
                    </div>
                    {dayData.isOpen && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPeriod(day.key)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar período
                      </Button>
                    )}
                  </div>
                  
                  {dayData.isOpen && (
                    <div className="space-y-2">
                      {dayData.periods.map((period, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={period.open}
                            onChange={(e) => updatePeriod(day.key, index, 'open', e.target.value)}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">-</span>
                          <Input
                            type="time"
                            value={period.close}
                            onChange={(e) => updatePeriod(day.key, index, 'close', e.target.value)}
                            className="w-24"
                          />
                          {dayData.periods.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePeriod(day.key, index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Horarios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
