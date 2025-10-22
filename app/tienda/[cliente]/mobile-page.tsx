'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { MobileMenuLayout } from '@/components/menu/mobile-menu-layout'
import { StoreNotFound } from '@/components/store/store-not-found'
import { StoreInactive } from '@/components/store/store-inactive'

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

interface Category {
  id: string
  name: string
  description: string
  color: string
  icon: string
  order: number
  isActive: boolean
  products: Product[]
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  imageUrl?: string
  isActive: boolean
  variants?: any[]
  options?: any[]
  globalOptions?: any[]
  category?: {
    id: string
    name: string
  }
}

interface CartItem {
  product: Product
  quantity: number
  selectedVariants: any[]
  selectedOptions: any
  price: number
  totalPrice: number
}

export default function MobileCustomerMenuPage() {
  const params = useParams()
  const clienteId = params.cliente as string
  
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [storeStatus, setStoreStatus] = useState<'loading' | 'found' | 'not-found' | 'inactive' | 'suspended'>('loading')
  const [inactiveReason, setInactiveReason] = useState<string | undefined>()
  const [isOpen, setIsOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Bloquear scroll del body cuando hay modales abiertos
  useEffect(() => {
    if (cart.length > 0) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [cart])

  useEffect(() => {
    setMounted(true)
    loadStoreData()
  }, [clienteId])

  const checkIfOpen = (storeData: StoreInfo) => {
    if (!storeData.enableBusinessHours) {
      return true // Por defecto, asumir abierto
    }

    // Lógica de horarios de negocio
    const now = new Date()
    const currentDay = now.getDay() // 0 = Domingo, 1 = Lunes, etc.
    const currentTime = now.getHours() * 100 + now.getMinutes()

    if (storeData.unifiedSchedule) {
      try {
        const schedule = typeof storeData.unifiedSchedule === 'string' 
          ? JSON.parse(storeData.unifiedSchedule) 
          : storeData.unifiedSchedule

        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const todaySchedule = schedule[dayNames[currentDay]]

        if (todaySchedule && todaySchedule.isAvailable) {
          // Manejar formato de slots (ej: ['13:00-15:00', '19:00-22:00'])
          if (todaySchedule.slots && Array.isArray(todaySchedule.slots)) {
            for (const slot of todaySchedule.slots) {
              const [openTimeStr, closeTimeStr] = slot.split('-')
              const openTime = parseInt(openTimeStr.replace(':', ''))
              const closeTime = parseInt(closeTimeStr.replace(':', ''))
              
              if (currentTime >= openTime && currentTime <= closeTime) {
                return true
              }
            }
          }
          // Manejar formato tradicional (openTime/closeTime)
          else if (todaySchedule.openTime && todaySchedule.closeTime) {
            const openTime = parseInt(todaySchedule.openTime.replace(':', ''))
            const closeTime = parseInt(todaySchedule.closeTime.replace(':', ''))
            
            return currentTime >= openTime && currentTime <= closeTime
          }
        }
      } catch (error) {
        console.error('Error parsing schedule:', error)
      }
    }

    // Si no hay horarios configurados pero están habilitados, asumir cerrado
    return false
  }

  const loadStoreData = async () => {
    try {
      setLoading(true)
      setStoreStatus('loading')
      console.log('🔄 Loading store data for:', clienteId)

      // Cargar información de la tienda
      const storeResponse = await fetch(`/api/tienda/${clienteId}`)
      console.log('🏪 Store response:', storeResponse.status)

      if (storeResponse.ok) {
        // Tienda encontrada y activa
        const storeData = await storeResponse.json()
        console.log('🏪 Store data:', storeData)
        setStoreInfo(storeData)
        setStoreStatus('found')
        setIsOpen(checkIfOpen(storeData))

        // Cargar categorías y productos
        const categoriesResponse = await fetch(`/api/tienda/${clienteId}/categories`)
        console.log('📁 Categories response:', categoriesResponse.status)

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          console.log('📁 Categories data:', categoriesData)
          setCategories(categoriesData)
        } else {
          // Tienda sin categorías (válido)
          console.warn('⚠️ No categories found for store')
          setCategories([])
        }
      } else if (storeResponse.status === 404) {
        // Tienda no encontrada
        console.error('❌ Store not found:', clienteId)
        setStoreStatus('not-found')
      } else if (storeResponse.status === 403) {
        // Tienda inactiva o suspendida
        const errorData = await storeResponse.json()
        console.error('❌ Store inactive/suspended:', errorData)
        
        if (errorData.reason === 'suspended') {
          setStoreStatus('suspended')
        } else {
          setStoreStatus('inactive')
          setInactiveReason(errorData.reason)
        }
        
        // Aún así, cargar datos básicos para mostrar el mensaje
        setStoreInfo({
          id: '',
          storeName: errorData.storeName || 'Tienda',
          storeSlug: clienteId,
          email: '',
          address: null,
          whatsappMainNumber: '',
          country: 'Mexico',
          currency: 'MXN',
          deliveryEnabled: false,
          useBasePrice: false,
          baseDeliveryPrice: 0,
          baseDeliveryThreshold: 0,
          deliveryScheduleEnabled: false,
          scheduleType: 'unified',
          advanceDays: 1,
          serviceHours: {},
          unifiedSchedule: {},
          storeActive: false,
          passwordProtected: false,
          enableBusinessHours: false,
          bannerImage: undefined,
          profileImage: undefined
        })
      } else {
        console.error('❌ Unexpected error:', storeResponse.status)
        setStoreStatus('not-found')
      }
    } catch (error) {
      console.error('❌ Error loading store data:', error)
      setStoreStatus('not-found')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product, quantity: number, selectedVariants: any[] = [], selectedOptions: any = {}) => {
    if (quantity <= 0) {
      return
    }

    const existingItem = cart.find(item =>
      item.product.id === product.id &&
      JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants) &&
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    )

    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id &&
        JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants) &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
          ? { ...item, quantity: item.quantity + quantity, price: product.price, totalPrice: (item.quantity + quantity) * product.price }
          : item
      ))
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        selectedVariants,
        selectedOptions,
        price: product.price,
        totalPrice: product.price * quantity
      }
      setCart([...cart, newItem])
    }
    
    toast.success(`${product.name} agregado al carrito`)
  }

  const removeFromCart = (productId: string, selectedVariants: any[] = [], selectedOptions: any = {}) => {
    setCart(cart.filter(item => 
      !(item.product.id === productId &&
        JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants) &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions))
    ))
    toast.success('Producto eliminado del carrito')
  }

  const updateQuantity = (productId: string, quantity: number, selectedVariants: any[] = [], selectedOptions: any = {}) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariants, selectedOptions)
      return
    }
    
    setCart(cart.map(item => 
      item.product.id === productId &&
      JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants) &&
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
        ? { ...item, quantity, totalPrice: quantity * item.product.price }
        : item
    ))
  }

  const handleCall = () => {
    if (storeInfo?.whatsappMainNumber) {
      window.open(`tel:${storeInfo.whatsappMainNumber}`, '_self')
    } else {
      toast.error('Número de teléfono no disponible')
    }
  }

  const handleWhatsApp = () => {
    if (storeInfo?.whatsappMainNumber) {
      const message = `Hola! Me interesa hacer un pedido de ${storeInfo.storeName}`
      window.open(`https://wa.me/${storeInfo.whatsappMainNumber}?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      toast.error('Número de WhatsApp no disponible')
    }
  }

  const handleMapClick = () => {
    if (storeInfo?.address?.latitude && storeInfo?.address?.longitude) {
      const { latitude, longitude } = storeInfo.address
      const mapsUrl = `https://www.google.com/maps/@${latitude},${longitude},21z`
      window.open(mapsUrl, '_blank')
    } else {
      toast.error('Ubicación no disponible')
    }
  }

  const handleHoursClick = () => {
    toast.info('Horarios de atención próximamente')
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    // El checkout se maneja en el MobileMenuLayout
  }

  const handleOrderComplete = (orderData: any) => {
    setCart([]) // Limpiar carrito
    toast.success('¡Pedido realizado con éxito!')
  }

  // Evitar hidratación hasta que el componente esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    )
  }

  // Tienda no encontrada
  if (storeStatus === 'not-found') {
    return <StoreNotFound slug={clienteId} />
  }

  // Tienda suspendida
  if (storeStatus === 'suspended') {
    return <StoreInactive storeName={storeInfo?.storeName} reason="suspended" />
  }

  // Tienda inactiva
  if (storeStatus === 'inactive') {
    return <StoreInactive storeName={storeInfo?.storeName} reason="inactive" />
  }

  // Sin datos de tienda
  if (!storeInfo) {
    return <StoreNotFound slug={clienteId} />
  }

  return (
    <MobileMenuLayout
      storeInfo={storeInfo}
      categories={categories}
      isOpen={isOpen}
      onMapClick={handleMapClick}
      onCall={handleCall}
      onWhatsApp={handleWhatsApp}
      onShare={() => {}}
      onHoursClick={handleHoursClick}
      onAddToCart={addToCart}
      onUpdateQuantity={updateQuantity}
      onRemoveFromCart={removeFromCart}
      cart={cart}
      onCheckout={handleCheckout}
      onOrderComplete={handleOrderComplete}
    />
  )
}
