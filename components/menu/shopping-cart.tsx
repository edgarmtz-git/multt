'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  CreditCard,
  Trash2
} from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  imageUrl?: string
}

interface ProductVariant {
  id: string
  name: string
  price: number
}

interface ProductOptionChoice {
  id: string
  name: string
  price: number
}

interface CartItem {
  product: Product
  quantity: number
  selectedVariants: ProductVariant[]
  selectedOptions: { [optionId: string]: ProductOptionChoice[] }
  totalPrice: number
}

interface ShoppingCartProps {
  cart: CartItem[]
  isOpen: boolean
  onClose: () => void
  onUpdateQuantity: (productId: string, quantity: number, selectedVariants?: ProductVariant[], selectedOptions?: { [optionId: string]: ProductOptionChoice[] }) => void
  onRemoveItem: (productId: string, selectedVariants?: ProductVariant[], selectedOptions?: { [optionId: string]: ProductOptionChoice[] }) => void
  onCheckout: () => void
}

export function ShoppingCartSidebar({
  cart,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: ShoppingCartProps) {
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md sm:max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {getCartItemsCount() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {getCartItemsCount()}
                </Badge>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tu carrito</h2>
              <p className="text-sm text-gray-600">{getCartItemsCount()} {getCartItemsCount() === 1 ? 'artículo' : 'artículos'}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="h-10 w-10 sm:h-8 sm:w-8 p-0"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-600 mb-6">Agrega algunos productos para comenzar tu pedido</p>
              
              {/* Botón para ir al menú cuando está vacío */}
              <Button 
                onClick={onClose}
                className="w-full max-w-xs py-3 min-h-[48px]"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ir al menú
              </Button>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4">
              {cart.map((item, index) => {
                // Crear una clave única que incluya el ID del producto, variantes y opciones
                const uniqueKey = `${item.product.id}-${JSON.stringify(item.selectedVariants)}-${JSON.stringify(item.selectedOptions)}-${index}`
                
                return (
                <div key={uniqueKey} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-xl">🍽️</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">
                      {item.product.name}
                    </h3>
                    
                    {/* Variants */}
                    {item.selectedVariants.length > 0 && (
                      <div className="mt-1">
                        {item.selectedVariants.map((variant) => (
                          <span 
                            key={variant.id}
                            className="inline-block text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded mr-1 mb-1"
                          >
                            {variant.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Options */}
                    {Object.values(item.selectedOptions).flat().length > 0 && (
                      <div className="mt-1">
                        {Object.values(item.selectedOptions).flat().map((choice) => (
                          <span 
                            key={choice.id}
                            className="inline-block text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded mr-1 mb-1"
                          >
                            + {choice.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price and Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedVariants, item.selectedOptions)}
                          className="h-10 w-10 sm:h-8 sm:w-8 p-0"
                        >
                          <Minus className="h-4 w-4 sm:h-3 sm:w-3" />
                        </Button>
                        <span className="text-sm font-medium w-10 sm:w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedVariants, item.selectedOptions)}
                          className="h-10 w-10 sm:h-8 sm:w-8 p-0"
                        >
                          <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveItem(item.product.id, item.selectedVariants, item.selectedOptions)}
                          className="h-10 w-10 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t bg-white p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">${getCartTotal().toFixed(2)}</span>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={onCheckout}
                className="w-full py-4 sm:py-3 rounded-lg font-medium min-h-[56px]"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Comprar ahora
              </Button>
              
              <Button 
                variant="outline"
                onClick={onClose}
                className="w-full py-3 sm:py-2 min-h-[48px]"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Seguir comprando
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
