'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Truck, Calendar, CheckCircle, XCircle } from 'lucide-react'

interface AvailabilityData {
  storeName: string
  date: string
  isOpen: boolean
  currentPeriod: {
    open: string
    close: string
  } | null
  deliveryOptions: string[]
  nextAvailableTimes: Array<{
    date: string
    day: string
    open: string
    close: string
    isToday: boolean
  }>
}

interface AvailabilityDisplayProps {
  userId: string
}

export default function AvailabilityDisplay({ userId }: AvailabilityDisplayProps) {
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAvailability()
    
    // Actualizar cada minuto
    const interval = setInterval(checkAvailability, 60000)
    return () => clearInterval(interval)
  }, [userId])

  const checkAvailability = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/availability/check?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setAvailability(data)
        setError(null)
      } else {
        setError(data.error || 'Error al verificar disponibilidad')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':')
    return `${hour}:${minute}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDayName = (day: string) => {
    const days = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    }
    return days[day as keyof typeof days] || day
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Verificando disponibilidad...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={checkAvailability} className="mt-2">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!availability) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Estado Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{availability.storeName}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(availability.date)}
              </p>
            </div>
            <Badge variant={availability.isOpen ? "default" : "secondary"}>
              {availability.isOpen ? (
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
          
          {availability.isOpen && availability.currentPeriod && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Horario actual:</strong> {formatTime(availability.currentPeriod.open)} - {formatTime(availability.currentPeriod.close)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opciones de entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Opciones de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availability.deliveryOptions.length > 0 ? (
            <div className="space-y-2">
              {availability.deliveryOptions.map(option => (
                <div key={option} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="capitalize">
                    {option === 'immediate' && 'Entrega inmediata'}
                    {option === 'scheduled' && 'Entrega programada'}
                    {option === 'pickup' && 'Recogida en tienda'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <XCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No hay opciones de entrega disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximos horarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Horarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availability.nextAvailableTimes.slice(0, 5).map((time, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {getDayName(time.day)} {time.isToday && '(Hoy)'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(time.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatTime(time.open)} - {formatTime(time.close)}
                  </p>
                  {time.isToday && (
                    <Badge variant="outline" className="text-xs">
                      Hoy
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botón de actualización */}
      <div className="flex justify-center">
        <Button onClick={checkAvailability} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Actualizar Estado
        </Button>
      </div>
    </div>
  )
}
