'use client'

import { useState, useEffect } from 'react'
import { MobileMenuHeader } from './mobile-menu-header'
import { MobileCategoryFilter } from './mobile-category-filter'
import { MobileProductCard } from './mobile-product-card'
import { MobileCartFab } from './mobile-cart-fab'
import { ShoppingCartSidebar } from './shopping-cart'
import SingleCardCheckout from '@/components/checkout/single-card-checkout'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'

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

interface MobileMenuLayoutProps {
  storeInfo: StoreInfo
  categories: Category[]
  isOpen: boolean
  onMapClick: () => void
  onCall: () => void
  onWhatsApp: () => void
  onShare: () => void
  onHoursClick: () => void
  onAddToCart: (product: Product, quantity: number, variants: any[], options: any) => void
  onUpdateQuantity: (productId: string, quantity: number, variants: any[], options: any) => void
  onRemoveFromCart: (productId: string, variants: any[], options: any) => void
  cart: CartItem[]
  onCheckout: () => void
  onOrderComplete: (orderData: any) => void
}

export function MobileMenuLayout({
  storeInfo,
  categories,
  isOpen,
  onMapClick,
  onCall,
  onWhatsApp,
  onShare,
  onHoursClick,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  cart,
  onCheckout,
  onOrderComplete
}: MobileMenuLayoutProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<any>(null)

  // Filtrar categorías y productos
  const filteredCategories = categories.filter(category => 
    category.isActive && 
    category.products.some(product => 
      product.isActive && 
      (searchTerm === '' || 
       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )

  const displayCategories = selectedCategory 
    ? filteredCategories.filter(category => category.id === selectedCategory)
    : filteredCategories

  const totalProducts = categories.reduce((total, category) => 
    total + category.products.filter(product => product.isActive).length, 0
  )

  const handleCheckout = () => {
    setShowCheckout(true)
    setCartOpen(false)
  }

  const handleOrderComplete = (orderData: any) => {
    setCompletedOrder(orderData)
    setShowCheckout(false)
    onOrderComplete(orderData)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: storeInfo.storeName,
        text: `Mira el menú de ${storeInfo.storeName}`,
        url: window.location.href
      })
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href)
      // Aquí podrías mostrar un toast
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PWA Components */}
      <InstallPrompt />
      <ServiceWorkerRegister />
      
      {/* Header mejorado */}
      <MobileMenuHeader
        storeInfo={storeInfo}
        isOpen={isOpen}
        onMapClick={onMapClick}
        onCall={onCall}
        onWhatsApp={onWhatsApp}
        onShare={handleShare}
        onHoursClick={onHoursClick}
      />

      {/* Filtros de categoría */}
      <MobileCategoryFilter
        categories={categories}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        totalProducts={totalProducts}
      />

      {/* Lista de productos */}
      <div className="px-4 py-6">
        {displayCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'No hay productos disponibles en este momento'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayCategories.map((category) => (
              <div key={category.id}>
                {/* Título de categoría */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grid de productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {category.products
                    .filter(product => product.isActive)
                    .map((product) => {
                      const cartItem = cart.find(item => 
                        item.product.id === product.id &&
                        JSON.stringify(item.selectedVariants) === JSON.stringify([]) &&
                        JSON.stringify(item.selectedOptions) === JSON.stringify({})
                      )
                      
                      return (
                        <MobileProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={onAddToCart}
                          cartQuantity={cartItem?.quantity || 0}
                          onUpdateQuantity={onUpdateQuantity}
                          onRemoveFromCart={onRemoveFromCart}
                        />
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB del carrito */}
      <MobileCartFab
        cart={cart}
        onClick={() => setCartOpen(true)}
        onCheckout={handleCheckout}
      />

      {/* Sidebar del carrito */}
      <ShoppingCartSidebar
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Checkout */}
      {showCheckout && (
        <SingleCardCheckout
          storeSlug={storeInfo.storeSlug}
          cartItems={cart}
          subtotal={cart.reduce((sum, item) => sum + item.totalPrice, 0)}
          deliveryFee={storeInfo.deliveryEnabled ? (storeInfo.baseDeliveryPrice || 0) : 0}
          total={cart.reduce((sum, item) => sum + item.totalPrice, 0) + (storeInfo.deliveryEnabled ? (storeInfo.baseDeliveryPrice || 0) : 0)}
          onOrderComplete={handleOrderComplete}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {/* Espaciado para el FAB */}
      <div className="h-24" />
    </div>
  )
}
