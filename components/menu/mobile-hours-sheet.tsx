'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Phone, X } from 'lucide-react'

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

interface MobileHoursSheetProps {
  isOpen: boolean
  onClose: () => void
  storeInfo: StoreInfo
  isOpenNow: boolean
}

export function MobileHoursSheet({ isOpen, onClose, storeInfo, isOpenNow }: MobileHoursSheetProps) {
  const [parsedSchedule, setParsedSchedule] = useState<any>(null)

  useEffect(() => {
    console.log('🕐 MobileHoursSheet - StoreInfo received:', {
      enableBusinessHours: storeInfo?.enableBusinessHours,
      unifiedSchedule: storeInfo?.unifiedSchedule,
      serviceHours: storeInfo?.serviceHours
    })

    if (storeInfo?.unifiedSchedule) {
      try {
        const schedule = typeof storeInfo.unifiedSchedule === 'string' 
          ? JSON.parse(storeInfo.unifiedSchedule) 
          : storeInfo.unifiedSchedule
        console.log('🕐 MobileHoursSheet - Parsed unifiedSchedule:', schedule)
        
        // Convertir el formato de slots a formato de horarios
        const convertedSchedule = {
          sunday: schedule.sunday ? {
            isOpen: schedule.sunday.isAvailable || false,
            openTime: schedule.sunday.slots?.[0]?.split('-')[0] || "11:00",
            closeTime: schedule.sunday.slots?.[schedule.sunday.slots.length - 1]?.split('-')[1] || "21:00",
            slots: schedule.sunday.slots || []
          } : { isOpen: false, openTime: "11:00", closeTime: "21:00", slots: [] },
          monday: schedule.monday ? {
            isOpen: schedule.monday.isAvailable || false,
            openTime: schedule.monday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.monday.slots?.[schedule.monday.slots.length - 1]?.split('-')[1] || "22:00",
            slots: schedule.monday.slots || []
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          tuesday: schedule.tuesday ? {
            isOpen: schedule.tuesday.isAvailable || false,
            openTime: schedule.tuesday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.tuesday.slots?.[schedule.tuesday.slots.length - 1]?.split('-')[1] || "22:00",
            slots: schedule.tuesday.slots || []
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          wednesday: schedule.wednesday ? {
            isOpen: schedule.wednesday.isAvailable || false,
            openTime: schedule.wednesday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.wednesday.slots?.[schedule.wednesday.slots.length - 1]?.split('-')[1] || "22:00",
            slots: schedule.wednesday.slots || []
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          thursday: schedule.thursday ? {
            isOpen: schedule.thursday.isAvailable || false,
            openTime: schedule.thursday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.thursday.slots?.[schedule.thursday.slots.length - 1]?.split('-')[1] || "22:00",
            slots: schedule.thursday.slots || []
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          friday: schedule.friday ? {
            isOpen: schedule.friday.isAvailable || false,
            openTime: schedule.friday.slots?.[0]?.split('-')[0] || "09:00",
            closeTime: schedule.friday.slots?.[schedule.friday.slots.length - 1]?.split('-')[1] || "22:00",
            slots: schedule.friday.slots || []
          } : { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          saturday: schedule.saturday ? {
            isOpen: schedule.saturday.isAvailable || false,
            openTime: schedule.saturday.slots?.[0]?.split('-')[0] || "10:00",
            closeTime: schedule.saturday.slots?.[schedule.saturday.slots.length - 1]?.split('-')[1] || "22:00",
            slots: schedule.saturday.slots || []
          } : { isOpen: false, openTime: "10:00", closeTime: "22:00", slots: [] }
        }
        
        console.log('🕐 MobileHoursSheet - Converted schedule:', convertedSchedule)
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
        console.log('🕐 MobileHoursSheet - Parsed serviceHours:', serviceHours)
        
        // Convertir serviceHours al formato del modal
        const convertedSchedule = {
          sunday: serviceHours.sunday || { isOpen: false, openTime: "11:00", closeTime: "21:00", slots: [] },
          monday: serviceHours.monday || { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          tuesday: serviceHours.tuesday || { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          wednesday: serviceHours.wednesday || { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          thursday: serviceHours.thursday || { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          friday: serviceHours.friday || { isOpen: false, openTime: "09:00", closeTime: "22:00", slots: [] },
          saturday: serviceHours.saturday || { isOpen: false, openTime: "10:00", closeTime: "22:00", slots: [] }
        }
        console.log('🕐 MobileHoursSheet - Converted schedule:', convertedSchedule)
        setParsedSchedule(convertedSchedule)
      } catch (error) {
        console.error('Error parsing serviceHours:', error)
        setParsedSchedule(null)
      }
    } else {
      console.log('🕐 MobileHoursSheet - No schedule data available')
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <SheetHeader className="sticky top-0 bg-white z-10 p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">
              Horarios de Atención
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-center mb-4 text-lg">
                Horarios de la Semana
              </h3>
              
              {dayKeys.map((dayKey, index) => {
                const daySchedule = parsedSchedule[dayKey]
                const isToday = index === getCurrentDay()
                
                return (
                  <div 
                    key={dayKey}
                    className={`p-4 rounded-2xl border-2 ${
                      isToday 
                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${
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
                    </div>
                    
                    <div>
                      {daySchedule?.isOpen ? (
                        <div className="space-y-2">
                          {daySchedule.slots && daySchedule.slots.length > 0 ? (
                            // Mostrar múltiples slots
                            <div className="space-y-1">
                              {daySchedule.slots.map((slot: string, slotIndex: number) => (
                                <div key={slotIndex} className="text-base font-medium text-gray-700 bg-white px-3 py-2 rounded-lg">
                                  {slot}
                                </div>
                              ))}
                            </div>
                          ) : (
                            // Formato tradicional
                            <div className="text-base font-medium text-gray-700 bg-white px-3 py-2 rounded-lg">
                              {formatTime(daySchedule.openTime)} - {formatTime(daySchedule.closeTime)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-base text-gray-500 font-medium bg-white px-3 py-2 rounded-lg text-center">
                          Cerrado
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
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
          <div className="bg-gray-50 -mx-6 px-6 py-6 rounded-t-2xl">
            <h3 className="font-semibold text-gray-900 mb-4 text-center text-lg">
              Información de Contacto
            </h3>
            
            <div className="space-y-4">
              {storeInfo?.address && (
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 mb-1">Dirección</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {storeInfo.address.street || storeInfo.address.address || 'Dirección no disponible'}
                    </p>
                  </div>
                </div>
              )}
              
              {storeInfo?.whatsappMainNumber && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
                  <Phone className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 mb-1">Teléfono</p>
                    <p className="text-sm text-gray-600">{storeInfo.whatsappMainNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
