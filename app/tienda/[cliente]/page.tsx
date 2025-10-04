'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  ShoppingCart, 
  Clock, 
  MapPin, 
  Star, 
  Filter,
  Plus,
  Minus,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Truck,
  Store,
  Timer,
  Shield,
  CreditCard,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { ProductModal } from '@/components/menu/product-modal'
import { ShoppingCartSidebar } from '@/components/menu/shopping-cart'
import { CartFab } from '@/components/menu/cart-fab'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import SingleCardCheckout from '@/components/checkout/single-card-checkout'

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
  bannerImage?: string
  profileImage?: string
}

interface Category {
  id: string
  name: string
  description: string
  order: number
  isActive: boolean
  products: Product[]
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  isActive: boolean
  variants?: ProductVariant[]
  options?: ProductOption[]
  globalOptions?: ProductOption[]
  category: Category
}

interface ProductVariant {
  id: string
  name: string
  price: number
  sku: string
}

interface ProductOption {
  id: string
  name: string
  type: string
  required: boolean
  choices: ProductOptionChoice[]
}

interface ProductOptionChoice {
  id: string
  name: string
  price: number
  isDefault: boolean
}

interface CartItem {
  product: Product
  quantity: number
  selectedVariants: ProductVariant[]
  selectedOptions: { [optionId: string]: ProductOptionChoice[] }
  price: number
  totalPrice: number
}

export default function CustomerMenuPage() {
  const params = useParams()
  const clienteId = params.cliente as string
  
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showMapModal, setShowMapModal] = useState(false)
  const [showHoursModal, setShowHoursModal] = useState(false)
  const [isOpen, setIsOpen] = useState(false) // Cambiar a false para evitar hidratación
  const [showCheckout, setShowCheckout] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadStoreData()
    
    // Timeout de seguridad para evitar que se quede cargando indefinidamente
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Forcing loading to false after timeout')
        setLoading(false)
      }
    }, 10000) // 10 segundos

    return () => clearTimeout(timeout)
  }, [clienteId])

  // Función para verificar si el restaurante está abierto
  const checkIfOpen = (storeInfo: StoreInfo) => {
    if (!storeInfo.unifiedSchedule) {
      return true // Si no hay horarios configurados, asumir que está abierto
    }

    const now = new Date()
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()]
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    try {
      const schedule = typeof storeInfo.unifiedSchedule === 'string' 
        ? JSON.parse(storeInfo.unifiedSchedule) 
        : storeInfo.unifiedSchedule


      // Manejar formato de operatingHours
      if (schedule.operatingHours && schedule.operatingHours[currentDay]) {
        const dayConfig = schedule.operatingHours[currentDay]
        
        if (dayConfig.isOpen && dayConfig.periods && dayConfig.periods.length > 0) {
          for (const period of dayConfig.periods) {
            const [openHour, openMin] = period.open.split(':').map(Number)
            const [closeHour, closeMin] = period.close.split(':').map(Number)
            const openTime = openHour * 60 + openMin
            const closeTime = closeHour * 60 + closeMin
            
            
            if (currentTime >= openTime && currentTime <= closeTime) {
              return true
            }
          }
        }
        return false
      }

      // Manejar formato legacy
      const legacyDay = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
      if (schedule[legacyDay]) {
        const daySchedule = schedule[legacyDay]
        if (daySchedule.enabled) {
          const openTime = parseInt(daySchedule.openTime?.replace(':', '') || '0')
          const closeTime = parseInt(daySchedule.closeTime?.replace(':', '') || '2359')
          const currentTimeLegacy = now.getHours() * 100 + now.getMinutes()
          
          return currentTimeLegacy >= openTime && currentTimeLegacy <= closeTime
        }
      }
    } catch (error) {
      console.error('Error parsing schedule:', error)
    }

    return true // Por defecto, asumir abierto
  }

  const loadStoreData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading store data for:', clienteId)
      
      // Cargar información de la tienda
      const storeResponse = await fetch(`/api/tienda/${clienteId}`)
      console.log('🏪 Store response:', storeResponse.status)
      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        console.log('🏪 Store data:', storeData)
        setStoreInfo(storeData)
        setIsOpen(checkIfOpen(storeData))
      } else {
        console.error('❌ Store response error:', storeResponse.status)
        // Forzar datos de prueba si falla
        setStoreInfo({
          id: 'test',
          storeName: 'Nanixhe Chicken',
          storeSlug: 'mi-tienda-digital',
          email: 'test@test.com',
          address: null,
          whatsappMainNumber: '+1234567890',
          country: 'MX',
          currency: 'MXN',
          deliveryEnabled: false,
          useBasePrice: false,
          baseDeliveryPrice: 0,
          baseDeliveryThreshold: 0,
          deliveryScheduleEnabled: false,
          scheduleType: 'date',
          advanceDays: 1,
          serviceHours: {},
          unifiedSchedule: {},
          storeActive: true
        })
      }

      // Cargar categorías y productos
      const categoriesResponse = await fetch(`/api/tienda/${clienteId}/categories`)
      console.log('📁 Categories response:', categoriesResponse.status)
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        console.log('📁 Categories data:', categoriesData)
        setCategories(categoriesData)
      } else {
        console.error('❌ Categories response error:', categoriesResponse.status)
        // Forzar datos de prueba si falla
        setCategories([
          {
            id: '1',
            name: 'Bebidas',
            description: 'Bebidas frías y calientes',
            color: '#3B82F6',
            icon: '🥤',
            order: 1,
            isActive: true,
            imageUrl: null,
            isVisibleInStore: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'test',
            products: [
              {
                id: '1',
                name: 'Café Americano',
                description: 'Café negro americano',
                price: 35,
                stock: 0,
                imageUrl: null,
                isActive: true,
                hasVariants: false,
                variantType: null,
                variantLabel: null,
                deliveryHome: true,
                deliveryStore: false,
                deliveryBoth: true,
                trackQuantity: false,
                dailyCapacity: false,
                maxDailySales: null,
                maxOrderQuantity: false,
                maxQuantity: null,
                minOrderQuantity: false,
                minQuantity: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: 'test',
                variants: [],
                options: []
              }
            ]
          }
        ])
      }
    } catch (error) {
      console.error('❌ Error loading store data:', error)
      toast.error('Error al cargar la tienda')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product, quantity: number = 1, selectedVariants: ProductVariant[] = [], selectedOptions: { [optionId: string]: ProductOptionChoice[] } = {}) => {
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

  const removeFromCart = (productId: string, selectedVariants: ProductVariant[] = [], selectedOptions: { [optionId: string]: ProductOptionChoice[] } = {}) => {
    setCart(cart.filter(item => 
      !(item.product.id === productId &&
        JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants) &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions))
    ))
    toast.success('Producto eliminado del carrito')
  }

  // Calcular totales del carrito
  const calculateCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryFee = storeInfo?.deliveryEnabled ? (storeInfo?.baseDeliveryPrice || 0) : 0
    const total = subtotal + deliveryFee
    
    console.log('🛒 Cart totals calculation:', {
      cartItems: cart.length,
      subtotal,
      deliveryFee,
      total,
      storeInfo: storeInfo?.storeSlug
    })
    
    return { subtotal, deliveryFee, total }
  }


  // Obtener número de WhatsApp del vendedor
  const getVendorWhatsApp = () => {
    return storeInfo?.whatsappMainNumber || '1234567890'
  }

  // Manejar checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    setShowCheckout(true)
    setCartOpen(false)
  }

  // Manejar completar pedido
  const handleOrderComplete = (orderData: any) => {
    setCompletedOrder(orderData)
    setShowCheckout(false)
    setCart([]) // Limpiar carrito
    toast.success('¡Pedido realizado con éxito!')
  }

  const updateQuantity = (productId: string, quantity: number, selectedVariants: ProductVariant[] = [], selectedOptions: { [optionId: string]: ProductOptionChoice[] } = {}) => {
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

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCall = () => {
    if (storeInfo.whatsappMainNumber) {
      window.open(`tel:${storeInfo.whatsappMainNumber}`, '_self')
    } else {
      toast.error('Número de teléfono no disponible')
    }
  }

  const handleWhatsApp = () => {
    if (storeInfo.whatsappMainNumber) {
      const message = `Hola! Me interesa hacer un pedido de ${storeInfo.storeName}`
      window.open(`https://wa.me/${storeInfo.whatsappMainNumber}?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      toast.error('Número de WhatsApp no disponible')
    }
  }

  const handleMapClick = () => {
    if (storeInfo.address?.latitude && storeInfo.address?.longitude) {
      setShowMapModal(true)
    } else {
      toast.error('Ubicación no disponible')
    }
  }

  const filteredCategories = categories.filter(category => 
    category.isActive && 
    category.products.some(product => 
      product.isActive && 
      (searchTerm === '' || 
       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )

  // Filtrar categorías por selección
  const displayCategories = selectedCategory 
    ? filteredCategories.filter(category => category.id === selectedCategory)
    : filteredCategories

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

  if (!storeInfo || !storeInfo.storeActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tienda no disponible</h1>
          <p className="text-gray-600">Esta tienda no está disponible en este momento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Contenedor responsive para todas las pantallas */}
      <div className="w-full max-w-7xl mx-auto">
      {/* Banner y Header Mejorado */}
      <div className="relative">
        {/* Banner */}
        {storeInfo.bannerImage ? (
          <div className="h-40 lg:h-48 bg-white relative">
            <img 
              src={storeInfo.bannerImage} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
            {/* Overlay removido para evitar que oscurezca la imagen */}
            
            {/* Estado del restaurante - Esquina superior derecha */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-md ${
                isOpen 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                <span className="hidden sm:inline">{isOpen ? 'Abierto' : 'Cerrado'}</span>
                <span className="sm:hidden">{isOpen ? 'Abierto' : 'Cerrado'}</span>
              </div>
              
              {/* Botón de horarios */}
              <button 
                onClick={() => setShowHoursModal(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-md bg-white/90 text-gray-700 hover:bg-white hover:shadow-lg transition-all"
                title="Ver horarios"
              >
                <Timer className="w-3 h-3" />
                <span className="hidden sm:inline">Horario</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-40 lg:h-48 bg-white relative">
            {/* Estado del restaurante - Esquina superior derecha */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-md ${
                isOpen 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                <span className="hidden sm:inline">{isOpen ? 'Abierto' : 'Cerrado'}</span>
                <span className="sm:hidden">{isOpen ? 'Abierto' : 'Cerrado'}</span>
              </div>
              
              {/* Botón de horarios */}
              <button 
                onClick={() => setShowHoursModal(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-md bg-white/90 text-gray-700 hover:bg-white hover:shadow-lg transition-all"
                title="Ver horarios"
              >
                <Timer className="w-3 h-3" />
                <span className="hidden sm:inline">Horario</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Foto de perfil centrada - MEJORADA */}
        <div className="absolute -bottom-12 lg:-bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center">
            {storeInfo.profileImage ? (
              <img 
                src={storeInfo.profileImage} 
                alt="Perfil" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-bold text-2xl">
                {storeInfo.storeName.charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Header con información integrada - MEJORADO */}
      <div className="bg-white shadow-sm mt-12 lg:mt-16">
        <div className="px-4 lg:px-8 py-4">
          {/* Nombre y dirección */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-gray-900">{storeInfo.storeName}</h1>
            <div 
              className="flex items-center justify-center text-sm text-gray-600 mt-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleMapClick}
              title="Ver ubicación en mapa"
            >
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {storeInfo.address?.street || storeInfo.address?.address || 'Dirección no disponible'}
              </span>
            </div>
          </div>


          {/* Botones de acción */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="p-3 sm:p-2 min-h-[48px] sm:min-h-0" title="Favorito">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-3 sm:p-2 min-h-[48px] sm:min-h-0" title="Compartir">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-3 sm:p-2 min-h-[48px] sm:min-h-0" 
              title="Llamar"
              onClick={handleCall}
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-3 sm:p-2 min-h-[48px] sm:min-h-0" 
              title="WhatsApp"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-4 sm:py-3 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-base"
            />
          </div>
        </div>
      </div>


      {/* Categories Navigation - MEJORADA */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="whitespace-nowrap flex-shrink-0 py-2 px-4 min-h-[40px] sm:min-h-0"
            >
              Todos
            </Button>
            {filteredCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap flex-shrink-0 py-2 px-4 min-h-[40px] sm:min-h-0"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-4 lg:px-8 pt-8 pb-20 bg-white min-h-screen">
        {displayCategories.map((category) => (
          <div key={category.id} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 px-2">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.products
                .filter(product => product.isActive)
                .map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white shadow-md cursor-pointer rounded-2xl"
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowProductModal(true)
                  }}
                >
                  <CardContent className="p-0">
                    {/* Layout horizontal con imagen a la izquierda */}
                    <div className="flex h-32 sm:h-36">
                      {/* Imagen del producto - LADO IZQUIERDO */}
                      <div className="relative w-32 sm:w-40 h-full rounded-2xl overflow-hidden flex-shrink-0 p-1">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-2xl">
                            <span className="text-2xl sm:text-3xl">🍽️</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Contenido del producto - LADO DERECHO */}
                      <div className="flex-1 p-4 flex flex-col justify-between relative">
                        {/* Información principal */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-1 line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2 overflow-hidden">
                            {product.description}
                          </p>
                        </div>
                        
                        {/* Precio y botón en esquina inferior derecha */}
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className="font-bold text-lg text-gray-900">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          
                          {/* Botón agregar en esquina inferior derecha */}
                          <Button
                            className="bg-black hover:bg-gray-800 text-white rounded-full px-4 py-2 text-sm font-medium min-h-[36px] min-w-[80px]"
                            onClick={(e) => {
                              e.stopPropagation()
                              if ((product.variants && product.variants.length > 0) || (product.options && product.options.length > 0) || (product.globalOptions && product.globalOptions.length > 0)) {
                                setSelectedProduct(product)
                                setShowProductModal(true)
                              } else {
                                addToCart(product)
                              }
                            }}
                          >
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      </div> {/* Cierre del contenedor responsive */}

      {/* Cart FAB */}
      <CartFab 
        cart={cart} 
        onClick={() => setCartOpen(true)} 
      />

      {/* Shopping Cart Sidebar */}
      <ShoppingCartSidebar
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Product Modal */}
      {showProductModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false)
            setSelectedProduct(null)
          }}
          onAddToCart={addToCart}
        />
      )}

      {/* Modal de Mapa */}
      {showMapModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Ubicación del local</h2>
                <Button variant="ghost" onClick={() => setShowMapModal(false)}>
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              {storeInfo.address?.latitude && storeInfo.address?.longitude ? (
                <div className="space-y-4">
                  <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.google.com/maps?q=${storeInfo.address.latitude},${storeInfo.address.longitude}&z=15&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{storeInfo.address.street}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordenadas: {storeInfo.address.latitude.toFixed(6)}, {storeInfo.address.longitude.toFixed(6)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://www.google.com/maps?q=${storeInfo.address.latitude},${storeInfo.address.longitude}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Abrir en Google Maps
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Ubicación no disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Horarios */}
      {showHoursModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Horarios de Atención</h2>
                <Button variant="ghost" onClick={() => setShowHoursModal(false)}>
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-4">
              {storeInfo?.unifiedSchedule ? (
                <div className="space-y-3">
                  {(() => {
                    const schedule = typeof storeInfo.unifiedSchedule === 'string' 
                      ? JSON.parse(storeInfo.unifiedSchedule) 
                      : storeInfo.unifiedSchedule
                    
                    console.log('🔍 Modal Horarios - unifiedSchedule:', storeInfo.unifiedSchedule)
                    console.log('🔍 Modal Horarios - parsed schedule:', schedule)
                    
                    
                    // Manejar el formato de operatingHours
                    if (schedule.operatingHours) {
                      const dayNames = {
                        monday: 'Lunes',
                        tuesday: 'Martes', 
                        wednesday: 'Miércoles',
                        thursday: 'Jueves',
                        friday: 'Viernes',
                        saturday: 'Sábado',
                        sunday: 'Domingo'
                      }
                      
                      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()]
                      
                      return Object.entries(schedule.operatingHours).map(([day, config]: [string, any]) => {
                        const isToday = day === currentDay
                        
                        let timeDisplay = 'Cerrado'
                        if (config.isOpen && config.periods && config.periods.length > 0) {
                          const periods = config.periods.map((p: any) => `${p.open} - ${p.close}`).join(', ')
                          timeDisplay = periods
                        }
                        
                        return (
                          <div key={day} className={`flex justify-between items-center p-2 rounded ${isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                            <span className={`font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                              {dayNames[day as keyof typeof dayNames]} {isToday && '(Hoy)'}
                            </span>
                            <span className={`text-sm ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                              {timeDisplay}
                            </span>
                          </div>
                        )
                      })
                    }
                    
                    // Manejar formato legacy si existe
                    return Object.entries(schedule).map(([day, daySchedule]: [string, any]) => {
                      const dayName = day.charAt(0).toUpperCase() + day.slice(1)
                      const isToday = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase() === day
                      
                      return (
                        <div key={day} className={`flex justify-between items-center p-2 rounded ${isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                          <span className={`font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                            {dayName} {isToday && '(Hoy)'}
                          </span>
                          <span className={`text-sm ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                            {daySchedule.enabled ? `${daySchedule.openTime} - ${daySchedule.closeTime}` : 'Cerrado'}
                          </span>
                        </div>
                      )
                    })
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Horarios no configurados</p>
                  <p className="text-sm text-gray-400">Contacta al restaurante para conocer sus horarios</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      {/* Service Worker Registration */}
      <ServiceWorkerRegister />

      {/* Checkout Modal */}
      {showCheckout && storeInfo && (() => {
        const totals = calculateCartTotals()
        return (
          <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
            <div className="w-full max-w-4xl md:w-[90%]">
              <SingleCardCheckout
                storeSlug={storeInfo.storeSlug}
                cartItems={cart.map(item => ({
                  id: item.product.id,
                  name: item.product.name,
                  quantity: item.quantity,
                  price: item.price || 0,
                  variantName: item.variantName,
                  options: item.options
                }))}
                subtotal={totals.subtotal}
                deliveryFee={totals.deliveryFee}
                total={totals.total}
                onOrderComplete={handleOrderComplete}
                onClose={() => setShowCheckout(false)}
              />
            </div>
          </div>
        )
      })()}

      {/* Order Confirmation Modal */}
      {completedOrder && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                ¡Pedido Confirmado!
              </h2>
              
              <p className="text-gray-600 mb-4">
                Tu pedido #{completedOrder.orderNumber} ha sido enviado por WhatsApp al vendedor.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium mb-2">Resumen del pedido:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Cliente:</strong> {completedOrder.customerName}</p>
                  <p><strong>WhatsApp:</strong> {completedOrder.customerWhatsApp}</p>
                  <p><strong>Método de entrega:</strong> {completedOrder.deliveryMethod === 'pickup' ? 'Recoger en local' : 'Entrega a domicilio'}</p>
                  <p><strong>Método de pago:</strong> {completedOrder.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}</p>
                  <p><strong>Total:</strong> ${completedOrder.total.toFixed(2)}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setCompletedOrder(null)}
                className="w-full"
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}