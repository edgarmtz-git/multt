'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Minus, 
  Star, 
  Heart,
  ShoppingCart,
  Clock,
  Tag
} from 'lucide-react'
import { ProductModal } from './product-modal'

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

interface MobileProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number, variants: any[], options: any) => void
  cartQuantity?: number
  onUpdateQuantity?: (productId: string, quantity: number, variants: any[], options: any) => void
  onRemoveFromCart?: (productId: string, variants: any[], options: any) => void
}

export function MobileProductCard({
  product,
  onAddToCart,
  cartQuantity = 0,
  onUpdateQuantity,
  onRemoveFromCart
}: MobileProductCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0) {
      // Si tiene variantes, abrir modal
      setShowModal(true)
    } else {
      // Si no tiene variantes, agregar directamente
      onAddToCart(product, 1, [], {})
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0 && onRemoveFromCart) {
      onRemoveFromCart(product.id, [], {})
    } else if (onUpdateQuantity) {
      onUpdateQuantity(product.id, newQuantity, [], {})
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        {/* Imagen del producto */}
        <div 
          className="relative h-48 bg-gray-100 cursor-pointer group"
          onClick={() => setShowModal(true)}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-4xl opacity-50">🍽️</span>
            </div>
          )}
          
          {/* Badges superpuestos */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-1">
                -{discountPercentage}%
              </Badge>
            )}
            {product.category && (
              <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
                {product.category.name}
              </Badge>
            )}
          </div>
          
          {/* Botón de favorito */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Heart 
              className={`w-4 h-4 ${
                isLiked ? 'text-red-500 fill-current' : 'text-gray-400'
              }`} 
            />
          </button>
        </div>

        {/* Información del producto */}
        <div className="p-4">
          {/* Nombre y descripción */}
          <div className="mb-3">
            <h3 
              className="font-semibold text-gray-900 text-base mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setShowModal(true)}
            >
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>

          {/* Precio */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice!.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Indicador de variantes */}
            {product.variants && product.variants.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {product.variants.length} opciones
              </Badge>
            )}
          </div>

          {/* Botones de acción */}
          {cartQuantity > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(cartQuantity - 1)}
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">
                  {cartQuantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(cartQuantity + 1)}
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
                className="text-xs px-3 py-1.5 h-8"
              >
                Ver opciones
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Agregar al carrito
            </Button>
          )}
        </div>
      </div>

      {/* Modal del producto */}
      <ProductModal
        product={product}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddToCart={(product, quantity, variants, options) => {
          onAddToCart(product, quantity, variants, options)
          setShowModal(false)
        }}
      />
    </>
  )
}
