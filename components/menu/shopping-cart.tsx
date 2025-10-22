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

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-end md:items-center justify-end"
          onClick={onClose}
        >
          <div 
            className="bg-white w-full h-[85vh] md:h-auto md:max-h-[80vh] md:max-w-md md:rounded-xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
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
                    <h2 className="text-2xl font-bold text-gray-900">Tu carrito</h2>
                    <p className="text-sm text-gray-600">{getCartItemsCount()} {getCartItemsCount() === 1 ? 'artículo' : 'artículos'}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <span className="text-xl font-bold text-gray-600">✕</span>
                </button>
              </div>
            </div>
            
            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
                  <p className="text-gray-500">Agrega algunos productos para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={`${item.product.id}-${index}`} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        
                        {/* Variantes seleccionadas */}
                        {item.selectedVariants.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {item.selectedVariants.map(v => v.name).join(', ')}
                          </p>
                        )}
                        
                        {/* Opciones seleccionadas */}
                        {Object.keys(item.selectedOptions).length > 0 && (
                          <div className="mt-1">
                            {Object.entries(item.selectedOptions).map(([optionId, choices]) => (
                              <p key={optionId} className="text-xs text-gray-500">
                                {choices.map(choice => choice.name).join(', ')}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-gray-900">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                          
                          {/* Controles de cantidad */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateQuantity(
                                item.product.id, 
                                item.quantity - 1, 
                                item.selectedVariants, 
                                item.selectedOptions
                              )}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            
                            <span className="text-sm font-medium min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateQuantity(
                                item.product.id, 
                                item.quantity + 1, 
                                item.selectedVariants, 
                                item.selectedOptions
                              )}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(
                                item.product.id, 
                                item.selectedVariants, 
                                item.selectedOptions
                              )}
                              className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer fijo */}
            {cart.length > 0 && (
              <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
                <div className="space-y-4">
                  {/* Resumen del total */}
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  {/* Botón de checkout */}
                  <Button
                    onClick={onCheckout}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-lg font-bold text-lg h-14"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceder al pago
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}