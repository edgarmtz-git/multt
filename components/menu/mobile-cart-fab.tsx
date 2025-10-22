'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, X, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartItem {
  product: {
    id: string
    name: string
    price: number
    imageUrl?: string
  }
  quantity: number
  selectedVariants: any[]
  selectedOptions: any
  price: number
  totalPrice: number
}

interface MobileCartFabProps {
  cart: CartItem[]
  onClick: () => void
  onCheckout: () => void
  isOpen?: boolean
}

export function MobileCartFab({ 
  cart, 
  onClick, 
  onCheckout,
  isOpen = false 
}: MobileCartFabProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0)

  // Mostrar FAB solo si hay items en el carrito
  useEffect(() => {
    if (totalItems > 0) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [totalItems])

  // Animación de entrada
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-2xl">
      {/* Resumen del carrito */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button
              onClick={onClick}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
            </Button>
            {totalItems > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </Badge>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Botón de checkout */}
        <Button
          onClick={onCheckout}
          className="flex-1 max-w-[200px] h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg"
        >
          Ver carrito
          <ChevronUp className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Lista de productos en el carrito (expandible) */}
      {isOpen && (
        <div className="max-h-48 overflow-y-auto space-y-2 animate-in slide-in-from-bottom-2 duration-200">
          {cart.map((item, index) => (
            <div 
              key={`${item.product.id}-${index}`}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              {item.product.imageUrl && (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-600">
                  Cantidad: {item.quantity}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ${item.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
