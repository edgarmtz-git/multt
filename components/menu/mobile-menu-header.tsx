'use client'

import { useState } from 'react'
import Image from 'next/image'
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
      {/* Banner optimizado para móvil - MEJORADO */}
      <div className="relative h-52 sm:h-60 lg:h-64">
        {storeInfo.bannerImage ? (
          <>
            <Image
              src={storeInfo.bannerImage}
              alt="Banner"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Overlay gradiente mejorado */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
            <span className="text-7xl opacity-20">🍽️</span>
          </div>
        )}

        {/* Status y acciones - Top right - MEJORADOS */}
        <div className="absolute top-4 right-4 flex flex-col gap-2.5">
          {/* Estado del restaurante */}
          <Badge
            variant={isOpen ? "default" : "destructive"}
            className={`px-3 py-2 text-sm font-semibold shadow-xl backdrop-blur-sm ${
              isOpen
                ? 'bg-green-500/95 hover:bg-green-600 text-white'
                : 'bg-red-500/95 hover:bg-red-600 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{isOpen ? 'Abierto' : 'Cerrado'}</span>
            </div>
          </Badge>

          {/* Botón de horarios */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHoursModal(true)}
            className="px-3 py-2 h-auto bg-white/95 hover:bg-white shadow-xl text-gray-800 text-sm font-semibold backdrop-blur-sm transition-all duration-200"
          >
            <Timer className="w-4 h-4 mr-1.5" />
            Horario
          </Button>
        </div>
      </div>

      {/* Foto de perfil - MEJORADA con elevation */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden relative">
            {storeInfo.profileImage ? (
              <Image
                src={storeInfo.profileImage}
                alt="Perfil"
                fill
                className="object-cover rounded-full"
                priority
              />
            ) : (
              <span className="text-blue-600 font-bold text-2xl sm:text-3xl">
                {storeInfo.storeName.charAt(0)}
              </span>
            )}
          </div>
          {/* Ring decorativo */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-100 scale-110"></div>
        </div>
      </div>
      
      {/* Información de la tienda - MEJORADO */}
      <div className="pt-12 pb-6 px-4 sm:px-6">
        {/* Nombre de la tienda */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-2 tracking-tight">
          {storeInfo.storeName}
        </h1>

        {/* Dirección - Mejorada */}
        <div className="text-center mb-6">
          <button
            onClick={onMapClick}
            className="inline-flex items-center justify-center text-sm text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <MapPin className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
            <span className="max-w-xs truncate font-medium">
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

        {/* Botones de acción - Optimizados para móvil con mejor diseño */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onCall}
            className="flex-1 min-w-[100px] h-11 text-sm font-semibold rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <Phone className="w-4 h-4 mr-2" />
            Llamar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onWhatsApp}
            className="flex-1 min-w-[100px] h-11 text-sm font-semibold rounded-xl border-green-200 text-green-700 hover:bg-green-50 transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="flex-1 min-w-[100px] h-11 text-sm font-semibold rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </div>

        {/* Información adicional */}
        {storeInfo.deliveryEnabled && (
          <div className="text-center">
            <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200">
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
