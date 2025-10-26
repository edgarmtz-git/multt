'use client'

import { useState } from 'react'
import Image from 'next/image'
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
      <div className="bg-white rounded-3xl shadow-md border-0 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
        {/* Imagen del producto - MEJORADA */}
        <div
          className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer overflow-hidden"
          onClick={() => setShowModal(true)}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 50vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-5xl opacity-30">🍽️</span>
            </div>
          )}

          {/* Badges superpuestos - MEJORADOS */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge className="bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 shadow-lg">
                -{discountPercentage}%
              </Badge>
            )}
            {product.category && (
              <Badge variant="secondary" className="text-xs bg-white/95 text-gray-700 backdrop-blur-sm shadow-md">
                {product.category.name}
              </Badge>
            )}
          </div>

          {/* Botón de favorito - MEJORADO */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
            className="absolute top-3 right-3 p-2.5 bg-white/95 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 backdrop-blur-sm"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? 'text-red-500 fill-current' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* Información del producto - MEJORADA */}
        <div className="p-4">
          {/* Nombre y descripción */}
          <div className="mb-3">
            <h3
              className="font-bold text-gray-900 text-base mb-1.5 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors leading-snug"
              onClick={() => setShowModal(true)}
            >
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Precio - MEJORADO */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
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
              <Badge variant="outline" className="text-xs border-gray-300">
                {product.variants.length} opciones
              </Badge>
            )}
          </div>

          {/* Botones de acción - MEJORADOS */}
          {cartQuantity > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 bg-gray-50 rounded-full px-3 py-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(cartQuantity - 1)}
                  className="w-8 h-8 p-0 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </Button>

                <span className="text-sm font-bold text-gray-900 min-w-[24px] text-center">
                  {cartQuantity}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(cartQuantity + 1)}
                  className="w-8 h-8 p-0 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
                className="text-xs px-4 py-2 h-9 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Ver detalles
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 bg-black hover:bg-gray-900 text-white font-semibold rounded-full flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Agregar
            </Button>
          )}
        </div>
      </div>

      {/* Modal del producto */}
      <ProductModal
        product={{
          ...product,
          category: product.category || { name: 'Sin categoría' }
        }}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddToCart={(product, quantity, variants, options) => {
          onAddToCart({
            ...product,
            category: product.category ? {
              id: '',
              name: product.category.name
            } : undefined
          }, quantity, variants, options)
          setShowModal(false)
        }}
      />
    </>
  )
}
