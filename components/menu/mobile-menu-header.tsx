'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Share2,
  Timer,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SimpleMobileHours } from './simple-mobile-hours'

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

interface MobileMenuHeaderProps {
  storeInfo: StoreInfo
  isOpen: boolean
  onMapClick: () => void
  onCall: () => void
  onWhatsApp: () => void
  onShare: () => void
  onHoursClick: () => void
}

export function MobileMenuHeader({
  storeInfo,
  isOpen,
  onMapClick,
  onCall,
  onWhatsApp,
  onShare,
  onHoursClick
}: MobileMenuHeaderProps) {
  const [showFullAddress, setShowFullAddress] = useState(false)
  const [showHoursModal, setShowHoursModal] = useState(false)

  return (
    <div className="relative bg-white">
      {/* Banner optimizado para móvil */}
      <div className="relative h-48 sm:h-56 lg:h-64">
        {storeInfo.bannerImage ? (
          <img 
            src={storeInfo.bannerImage} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-6xl text-white opacity-80">🍽️</span>
          </div>
        )}
        
        {/* Overlay sutil para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Status y acciones - Top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Estado del restaurante */}
          <Badge 
            variant={isOpen ? "default" : "destructive"}
            className={`px-4 py-2 text-sm font-semibold shadow-lg ${
              isOpen 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span>{isOpen ? 'Abierto' : 'Cerrado'}</span>
            </div>
          </Badge>
          
          {/* Botón de horarios */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHoursModal(true)}
            className="px-4 py-2 h-auto bg-white/95 hover:bg-white shadow-lg text-gray-700 text-sm font-semibold"
          >
            <Timer className="w-4 h-4 mr-1.5" />
            Horario
          </Button>
        </div>
      </div>
      
      {/* Foto de perfil - Centrada y mejor posicionada */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
          {storeInfo.profileImage ? (
            <img 
              src={storeInfo.profileImage} 
              alt="Perfil" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-blue-600 font-bold text-xl sm:text-2xl">
              {storeInfo.storeName.charAt(0)}
            </span>
          )}
        </div>
      </div>
      
      {/* Información de la tienda - Mejor espaciado */}
      <div className="pt-10 pb-6 px-4 sm:px-6">
        {/* Nombre de la tienda */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3">
          {storeInfo.storeName}
        </h1>
        
        {/* Dirección - Mejorada */}
        <div className="text-center mb-4">
          <button
            onClick={onMapClick}
            className="flex items-center justify-center text-sm text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <MapPin className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
            <span className="max-w-xs truncate">
              {storeInfo.address?.street || storeInfo.address?.address || 'Dirección no disponible'}
            </span>
            <ChevronDown className="h-3 w-3 ml-1 group-hover:rotate-180 transition-transform" />
          </button>
          
          {/* Dirección completa expandible */}
          {showFullAddress && storeInfo.address && (
            <div className="mt-2 text-xs text-gray-500 animate-in slide-in-from-top-2 duration-200">
              <p>{storeInfo.address.street}</p>
              {storeInfo.address.neighborhood && <p>{storeInfo.address.neighborhood}</p>}
              {storeInfo.address.city && <p>{storeInfo.address.city}</p>}
            </div>
          )}
        </div>
        
        {/* Botones de acción - Optimizados para móvil */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onCall}
            className="flex-1 min-w-[130px] h-12 text-base font-semibold"
          >
            <Phone className="w-5 h-5 mr-2" />
            Llamar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onWhatsApp}
            className="flex-1 min-w-[130px] h-12 text-base font-semibold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="flex-1 min-w-[130px] h-12 text-base font-semibold"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Compartir
          </Button>
        </div>
        
        {/* Información adicional */}
        {storeInfo.deliveryEnabled && (
          <div className="mt-4 text-center">
            <Badge variant="secondary" className="text-xs">
              🚚 Envío disponible
            </Badge>
          </div>
        )}
      </div>

      {/* Modal de horarios simplificado para móvil */}
      <SimpleMobileHours
        isOpen={showHoursModal}
        onClose={() => setShowHoursModal(false)}
        storeInfo={storeInfo}
        isOpenNow={isOpen}
      />
    </div>
  )
}
