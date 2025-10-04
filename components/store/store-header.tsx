'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock,
  Star,
  Shield,
  CreditCard
} from 'lucide-react'

interface StoreHeaderProps {
  storeInfo: {
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
    bannerImage?: string
    profileImage?: string
  }
}

export function StoreHeader({ storeInfo }: StoreHeaderProps) {
  const [bannerLoaded, setBannerLoaded] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [bannerError, setBannerError] = useState(false)
  const [profileError, setProfileError] = useState(false)

  // Función para manejar errores de carga de imágenes
  const handleImageError = (type: 'banner' | 'profile') => {
    console.error(`❌ Error loading ${type} image`)
    if (type === 'banner') {
      setBannerError(true)
    } else {
      setProfileError(true)
    }
  }

  // Función para manejar carga exitosa de imágenes
  const handleImageLoad = (type: 'banner' | 'profile') => {
    console.log(`✅ ${type} image loaded successfully`)
    if (type === 'banner') {
      setBannerLoaded(true)
    } else {
      setProfileLoaded(true)
    }
  }

  // Función para obtener la URL completa de la imagen
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null
    
    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    // Si es una ruta relativa, construir la URL completa
    if (imagePath.startsWith('/')) {
      return imagePath
    }
    
    // Si no tiene extensión, intentar con .jpg
    if (!imagePath.includes('.')) {
      return `${imagePath}.jpg`
    }
    
    return imagePath
  }

  const bannerUrl = getImageUrl(storeInfo.bannerImage)
  const profileUrl = getImageUrl(storeInfo.profileImage)

  console.log('🔍 Store header images:', {
    bannerImage: storeInfo.bannerImage,
    profileImage: storeInfo.profileImage,
    bannerUrl,
    profileUrl
  })

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-40 lg:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
        {bannerUrl && !bannerError ? (
          <img 
            src={bannerUrl}
            alt="Banner de la tienda"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              bannerLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => handleImageLoad('banner')}
            onError={() => handleImageError('banner')}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">🏪</div>
              <div className="text-lg font-semibold">{storeInfo.storeName}</div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>
      
      {/* Foto de perfil centrada */}
      <div className="absolute -bottom-12 lg:-bottom-16 left-1/2 transform -translate-x-1/2">
        <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
          {profileUrl && !profileError ? (
            <img 
              src={profileUrl}
              alt="Foto de perfil"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                profileLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad('profile')}
              onError={() => handleImageError('profile')}
            />
          ) : (
            <span className="text-blue-600 font-bold text-2xl">
              {storeInfo.storeName.charAt(0)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}


