'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Phone, MessageCircle } from 'lucide-react'

interface StoreInfo {
  id: string
  storeName: string
  storeSlug: string
  email: string
  address: any
  whatsappMainNumber: string
  country: string
  currency: string
  deliveryEnabled: boolean
  useBasePrice: boolean
  baseDeliveryPrice: number
  baseDeliveryThreshold: number
  deliveryScheduleEnabled: boolean
  scheduleType: string
  advanceDays: number
  serviceHours: any
  unifiedSchedule: any
  storeActive: boolean
  passwordProtected: boolean
  enableBusinessHours: boolean
  bannerImage?: string
  profileImage?: string
}

interface HoursModalProps {
  isOpen: boolean
  onClose: () => void
  storeInfo: StoreInfo
  isOpenNow: boolean
}

export function HoursModal({ isOpen, onClose, storeInfo, isOpenNow }: HoursModalProps) {
  const [parsedSchedule, setParsedSchedule] = useState<any>(null)

  useEffect(() => {
    console.log('🕐 HoursModal - StoreInfo received:', {
      enableBusinessHours: storeInfo?.enableBusinessHours,
      unifiedSchedule: storeInfo?.unifiedSchedule,
      serviceHours: storeInfo?.serviceHours
    })

    if (storeInfo?.unifiedSchedule) {
      try {
        const schedule = typeof storeInfo.unifiedSchedule === 'string' 
          ? JSON.parse(storeInfo.unifiedSchedule) 
          : storeInfo.unifiedSchedule
        console.log('🕐 HoursModal - Parsed unifiedSchedule:', schedule)
        
        // Convertir el formato de slots a formato de horarios
        const convertedSchedule = {
          sunday: schedule.sunday ? {
            isOpen: schedule.sunday.isAvailable || false,
            openTime: schedule.sunday.slots?.[0]?.split('-')[0] || "11:00",
            closeTime: schedule.sunday.slots?.[schedule.sunday.slots.length - 1]?.split('-')[1] || "21:00"
          } : { isOpen: false, openTime: "11:00", closeTime: "21:00" },
          monday: schedule.monday ? {
            isOpen: schedule.monday.isAvailable || false,
            openTime: schedule.monday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.monday.slots?.[schedule.monday.slots.length - 1]?.split('-')[1] || "22:00"
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          tuesday: schedule.tuesday ? {
            isOpen: schedule.tuesday.isAvailable || false,
            openTime: schedule.tuesday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.tuesday.slots?.[schedule.tuesday.slots.length - 1]?.split('-')[1] || "22:00"
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          wednesday: schedule.wednesday ? {
            isOpen: schedule.wednesday.isAvailable || false,
            openTime: schedule.wednesday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.wednesday.slots?.[schedule.wednesday.slots.length - 1]?.split('-')[1] || "22:00"
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          thursday: schedule.thursday ? {
            isOpen: schedule.thursday.isAvailable || false,
            openTime: schedule.thursday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.thursday.slots?.[schedule.thursday.slots.length - 1]?.split('-')[1] || "22:00"
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          friday: schedule.friday ? {
            isOpen: schedule.friday.isAvailable || false,
            openTime: schedule.friday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.friday.slots?.[schedule.friday.slots.length - 1]?.split('-')[1] || "22:00"
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          saturday: schedule.saturday ? {
            isOpen: schedule.saturday.isAvailable || false,
            openTime: schedule.saturday.slots?.[0]?.split('-')[0] || "10:00",
            closeTime: schedule.saturday.slots?.[schedule.saturday.slots.length - 1]?.split('-')[1] || "22:00"
          } : { isOpen: false, openTime: "10:00", closeTime: "22:00" }
        }
        
        console.log('🕐 HoursModal - Converted schedule:', convertedSchedule)
        setParsedSchedule(convertedSchedule)
      } catch (error) {
        console.error('Error parsing unifiedSchedule:', error)
        setParsedSchedule(null)
      }
    } else if (storeInfo?.serviceHours) {
      try {
        const serviceHours = typeof storeInfo.serviceHours === 'string' 
          ? JSON.parse(storeInfo.serviceHours) 
          : storeInfo.serviceHours
        console.log('🕐 HoursModal - Parsed serviceHours:', serviceHours)
        
        // Convertir serviceHours al formato del modal
        const convertedSchedule = {
          sunday: serviceHours.sunday || { isOpen: false, openTime: "11:00", closeTime: "21:00" },
          monday: serviceHours.monday || { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          tuesday: serviceHours.tuesday || { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          wednesday: serviceHours.wednesday || { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          thursday: serviceHours.thursday || { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          friday: serviceHours.friday || { isOpen: false, openTime: "09:00", closeTime: "22:00" },
          saturday: serviceHours.saturday || { isOpen: false, openTime: "10:00", closeTime: "22:00" }
        }
        console.log('🕐 HoursModal - Converted schedule:', convertedSchedule)
        setParsedSchedule(convertedSchedule)
      } catch (error) {
        console.error('Error parsing serviceHours:', error)
        setParsedSchedule(null)
      }
    } else {
      console.log('🕐 HoursModal - No schedule data available')
      setParsedSchedule(null)
    }
  }, [storeInfo?.unifiedSchedule, storeInfo?.serviceHours])

  const dayNames = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ]

  const dayKeys = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ]

  const getCurrentDay = () => {
    const now = new Date()
    return now.getDay() // 0 = Domingo, 1 = Lunes, etc.
  }

  const formatTime = (time: string) => {
    if (!time) return '--:--'
    return time
  }

  const getStatusColor = (isOpen: boolean) => {
    return isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getStatusText = (isOpen: boolean) => {
    return isOpen ? 'Abierto ahora' : 'Cerrado'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-center">
            Horarios de Atención
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Estado actual */}
          <div className="text-center">
            <Badge 
              className={`px-4 py-2 text-sm font-semibold ${getStatusColor(isOpenNow)}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {getStatusText(isOpenNow)}
            </Badge>
          </div>

          {/* Horarios por día */}
          {parsedSchedule ? (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-center mb-3 text-lg">
                Horarios de la Semana
              </h3>
              
              {dayKeys.map((dayKey, index) => {
                const daySchedule = parsedSchedule[dayKey]
                const isToday = index === getCurrentDay()
                
                return (
                  <div 
                    key={dayKey}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                      isToday 
                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className={`font-semibold text-base ${
                        isToday ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {dayNames[index]}
                      </span>
                      {isToday && (
                        <Badge variant="default" className="text-xs bg-blue-600 text-white">
                          Hoy
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-right flex-1">
                      {daySchedule?.isOpen ? (
                        <div className="space-y-1">
                          {daySchedule.slots && Array.isArray(daySchedule.slots) ? (
                            // Mostrar múltiples slots
                            <div className="space-y-1">
                              {daySchedule.slots.map((slot: string, slotIndex: number) => (
                                <div key={slotIndex} className="text-sm font-medium text-gray-700">
                                  {slot}
                                </div>
                              ))}
                            </div>
                          ) : (
                            // Formato tradicional
                            <span className="text-sm font-medium text-gray-700">
                              {formatTime(daySchedule.openTime)} - {formatTime(daySchedule.closeTime)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 font-medium">
                          Cerrado
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {storeInfo?.enableBusinessHours 
                  ? 'Horarios no configurados'
                  : 'Horarios de atención no habilitados'
                }
              </p>
              {!storeInfo?.enableBusinessHours && (
                <p className="text-sm text-gray-500 mt-2">
                  El restaurante está abierto 24/7
                </p>
              )}
            </div>
          )}

          {/* Información de contacto */}
          <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
            <h3 className="font-semibold text-gray-900 mb-4 text-center text-lg">
              Información de Contacto
            </h3>
            
            <div className="space-y-3">
              {storeInfo?.address && (
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">Dirección</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {storeInfo.address.street || storeInfo.address.address || 'Dirección no disponible'}
                    </p>
                  </div>
                </div>
              )}
              
              {storeInfo?.whatsappMainNumber && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">Teléfono</p>
                    <p className="text-sm text-gray-600">{storeInfo.whatsappMainNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón de cerrar */}
          <div className="sticky bottom-0 bg-white pt-4 border-t">
            <Button onClick={onClose} className="w-full h-12 text-base font-semibold rounded-xl">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
