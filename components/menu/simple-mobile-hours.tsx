'use client'

import { useState, useEffect } from 'react'
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

interface SimpleMobileHoursProps {
  isOpen: boolean
  onClose: () => void
  storeInfo: StoreInfo
  isOpenNow: boolean
}

export function SimpleMobileHours({ isOpen, onClose, storeInfo, isOpenNow }: SimpleMobileHoursProps) {
  const [parsedSchedule, setParsedSchedule] = useState<any>(null)
  const [currentDay, setCurrentDay] = useState<number | null>(null)

  useEffect(() => {
    // Verificar que estamos en el cliente antes de manipular document
    if (typeof window === 'undefined') return

    // Establecer el día actual solo en el cliente
    setCurrentDay(new Date().getDay())

    // Prevenir scroll del body cuando el modal está abierto
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }

    // Cleanup al desmontar
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  useEffect(() => {
    console.log('🕐 SimpleMobileHours - StoreInfo received:', {
      enableBusinessHours: storeInfo?.enableBusinessHours,
      unifiedSchedule: storeInfo?.unifiedSchedule,
      serviceHours: storeInfo?.serviceHours
    })

    if (storeInfo?.unifiedSchedule) {
      try {
        const schedule = typeof storeInfo.unifiedSchedule === 'string' 
          ? JSON.parse(storeInfo.unifiedSchedule) 
          : storeInfo.unifiedSchedule
        console.log('🕐 SimpleMobileHours - Parsed unifiedSchedule:', schedule)
        
        // Convertir el formato de slots a formato de horarios
        const convertedSchedule = {
          sunday: schedule.sunday ? {
            isOpen: schedule.sunday.isAvailable || false,
            slots: schedule.sunday.slots || []
          } : { isOpen: false, slots: [] },
          monday: schedule.monday ? {
            isOpen: schedule.monday.isAvailable || false,
            slots: schedule.monday.slots || []
          } : { isOpen: false, slots: [] },
          tuesday: schedule.tuesday ? {
            isOpen: schedule.tuesday.isAvailable || false,
            slots: schedule.tuesday.slots || []
          } : { isOpen: false, slots: [] },
          wednesday: schedule.wednesday ? {
            isOpen: schedule.wednesday.isAvailable || false,
            slots: schedule.wednesday.slots || []
          } : { isOpen: false, slots: [] },
          thursday: schedule.thursday ? {
            isOpen: schedule.thursday.isAvailable || false,
            slots: schedule.thursday.slots || []
          } : { isOpen: false, slots: [] },
          friday: schedule.friday ? {
            isOpen: schedule.friday.isAvailable || false,
            slots: schedule.friday.slots || []
          } : { isOpen: false, slots: [] },
          saturday: schedule.saturday ? {
            isOpen: schedule.saturday.isAvailable || false,
            slots: schedule.saturday.slots || []
          } : { isOpen: false, slots: [] }
        }
        
        console.log('🕐 SimpleMobileHours - Converted schedule:', convertedSchedule)
        setParsedSchedule(convertedSchedule)
      } catch (error) {
        console.error('Error parsing unifiedSchedule:', error)
        setParsedSchedule(null)
      }
    } else {
      console.log('🕐 SimpleMobileHours - No schedule data available')
      setParsedSchedule(null)
    }
  }, [storeInfo?.unifiedSchedule, storeInfo?.serviceHours])

  const dayNames = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ]

  const dayKeys = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ]

  const getStatusColor = (isOpen: boolean) => {
    return isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getStatusText = (isOpen: boolean) => {
    return isOpen ? 'Abierto ahora' : 'Cerrado'
  }

  if (!isOpen) return null

  console.log('🕐 SimpleMobileHours - Rendering modal, isOpen:', isOpen)

  return (
    <div className="mobile-modal">
      {/* Overlay para cerrar */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className="mobile-modal-content"
        style={{
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Handle visual */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '0.75rem',
          paddingBottom: '0.5rem',
          flexShrink: 0
        }}>
          <div className="mobile-modal-handle" />
        </div>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          paddingTop: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0
        }}>
          <h2 style={{
            color: '#111827',
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: 0
          }}>
            Horarios de Atención
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '2rem',
              width: '2rem',
              padding: 0,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X style={{ height: '1rem', width: '1rem', color: '#6b7280' }} />
          </button>
        </div>

        {/* Content */}
        <div className="mobile-modal-scroll">
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Estado actual */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                borderRadius: '0.5rem',
                backgroundColor: isOpenNow ? '#dcfce7' : '#fef2f2',
                color: isOpenNow ? '#166534' : '#991b1b'
              }}>
                <Clock style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
                {getStatusText(isOpenNow)}
              </div>
            </div>

            {/* Horarios por día */}
            {parsedSchedule ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{
                  fontWeight: '600',
                  color: '#111827',
                  textAlign: 'center',
                  marginBottom: '1rem',
                  fontSize: '1.125rem',
                  margin: 0
                }}>
                  Horarios de la Semana
                </h3>
                
                {dayKeys.map((dayKey, index) => {
                  const daySchedule = parsedSchedule[dayKey]
                  const isToday = currentDay !== null && index === currentDay
                  
                  return (
                    <div 
                      key={dayKey}
                      style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        border: '2px solid',
                        borderColor: isToday ? '#93c5fd' : '#e5e7eb',
                        backgroundColor: isToday ? '#eff6ff' : '#f9fafb',
                        boxShadow: isToday ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            fontWeight: '700',
                            fontSize: '1.125rem',
                            color: isToday ? '#1e40af' : '#111827'
                          }}>
                            {dayNames[index]}
                          </span>
                          {isToday && (
                            <div style={{
                              fontSize: '0.75rem',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem'
                            }}>
                              Hoy
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        {daySchedule?.isOpen ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {daySchedule.slots && daySchedule.slots.length > 0 ? (
                              // Mostrar múltiples slots
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {daySchedule.slots.map((slot: string, slotIndex: number) => (
                                  <div key={slotIndex} style={{
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    backgroundColor: 'white',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e5e7eb'
                                  }}>
                                    {slot}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // Sin slots
                              <div style={{
                                fontSize: '1rem',
                                color: '#6b7280',
                                fontWeight: '500',
                                backgroundColor: 'white',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                textAlign: 'center'
                              }}>
                                Horarios no configurados
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{
                            fontSize: '1rem',
                            color: '#6b7280',
                            fontWeight: '500',
                            backgroundColor: 'white',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                          }}>
                            Cerrado
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <Clock style={{ height: '4rem', width: '4rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
                <p style={{ color: '#4b5563', fontSize: '1.125rem', margin: 0 }}>
                  {storeInfo?.enableBusinessHours 
                    ? 'Horarios no configurados'
                    : 'Horarios de atención no habilitados'
                  }
                </p>
                {!storeInfo?.enableBusinessHours && (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', margin: 0 }}>
                    El restaurante está abierto 24/7
                  </p>
                )}
              </div>
            )}

            {/* Información de contacto */}
            <div style={{
              backgroundColor: '#f9fafb',
              marginLeft: '-1.5rem',
              marginRight: '-1.5rem',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              paddingTop: '1.5rem',
              paddingBottom: '1.5rem',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem'
            }}>
              <h3 style={{
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '1.125rem',
                margin: 0
              }}>
                Información de Contacto
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {storeInfo?.address && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <MapPin style={{ height: '1.5rem', width: '1.5rem', color: '#2563eb', marginTop: '0.25rem', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem', margin: 0 }}>Dirección</p>
                      <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5', margin: 0 }}>
                        {storeInfo.address.street || storeInfo.address.address || 'Dirección no disponible'}
                      </p>
                    </div>
                  </div>
                )}
                
                {storeInfo?.whatsappMainNumber && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <Phone style={{ height: '1.5rem', width: '1.5rem', color: '#16a34a', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem', margin: 0 }}>Teléfono</p>
                      <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>{storeInfo.whatsappMainNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botón de cerrar fijo */}
        <div style={{
          flexShrink: 0,
          padding: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <button 
            onClick={onClose} 
            style={{
              width: '100%',
              height: '3rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '0.75rem',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
