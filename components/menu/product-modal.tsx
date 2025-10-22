'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  X,
  Plus,
  Minus,
  Star,
  Clock,
  Shield,
  Image
} from 'lucide-react'

interface ProductVariant {
  id: string
  name: string
  price: number
  originalPrice?: number
  sku?: string
  imageUrl?: string
  stock?: number
}

interface ProductOption {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'media'
  required: boolean
  choices: ProductOptionChoice[]
}

interface ProductOptionChoice {
  id: string
  name: string
  price: number
  isDefault: boolean
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
  category: {
    name: string
  }
}

interface ProductModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, selectedVariants: ProductVariant[], selectedOptions: { [optionId: string]: ProductOptionChoice[] }) => void
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>([])
  const [selectedOptions, setSelectedOptions] = useState<{ [optionId: string]: ProductOptionChoice[] }>({})
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Preseleccionar la variante más pequeña/barata automáticamente
  React.useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      // Ordenar variantes por precio (ascendente) y tomar la primera
      const sortedVariants = [...product.variants].sort((a, b) => a.price - b.price)
      setSelectedVariants([sortedVariants[0]])
    }
  }, [product.variants])

  const calculateTotalPrice = () => {
    // Si hay variantes seleccionadas, usar el precio de la variante como base
    // (para tamaños que reemplazan el precio base)
    let basePrice = product.price
    
    if (selectedVariants.length > 0) {
      // Para variantes de tamaño, usar el precio de la variante como base
      // En lugar de sumar al precio original
      const variant = selectedVariants[0]
      basePrice = variant.price
    }
    
    let total = basePrice * quantity
    
    // Agregar precio de opciones adicionales (extras, toppings, etc.)
    Object.values(selectedOptions).forEach(choices => {
      choices.forEach(choice => {
        total += choice.price * quantity
      })
    })
    
    return total
  }

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariants([variant])
  }

  const handleOptionChange = (optionId: string, choice: ProductOptionChoice, checked: boolean, maxSelections?: number) => {
    setSelectedOptions(prev => {
      const currentChoices = prev[optionId] || []
      
      if (checked) {
        // Verificar límite máximo
        if (maxSelections && currentChoices.length >= maxSelections) {
          return prev // No agregar si ya se alcanzó el máximo
        }
        return {
          ...prev,
          [optionId]: [...currentChoices, choice]
        }
      } else {
        return {
          ...prev,
          [optionId]: currentChoices.filter(c => c.id !== choice.id)
        }
      }
    })
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedVariants, selectedOptions)
    onClose()
  }

  const isAddToCartDisabled = () => {
    // Verificar si hay variantes y ninguna está seleccionada (obligatorio)
    if (product.variants && product.variants.length > 0 && selectedVariants.length === 0) {
      return true
    }
    
    // Verificar si hay opciones requeridas sin seleccionar
    if (product.options) {
      for (const option of product.options) {
        if (option.required && (!selectedOptions[option.id] || selectedOptions[option.id].length === 0)) {
          return true
        }
      }
    }
    
    // Verificar límites mínimos de opciones globales
    if ((product as any).globalOptions) {
      for (const option of (product as any).globalOptions) {
        const selectedCount = selectedOptions[option.id]?.length || 0
        if (option.isRequired && selectedCount < (option.minSelections || 1)) {
          return true
        }
      }
    }
    
    return false
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-end md:items-center justify-center"
          onClick={onClose}
        >
          <div 
            className="bg-white w-full h-[85vh] md:h-auto md:max-h-[80vh] md:max-w-2xl md:rounded-xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
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
              {/* Imagen del producto */}
              <div className="relative mb-6">
                {product.imageUrl ? (
                  <div className="h-64 sm:h-80 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 sm:h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-lg">
                    <span className="text-8xl">🍽️</span>
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Precio</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ${selectedVariants.length > 0 ? selectedVariants[0].price.toFixed(2) : product.price.toFixed(2)}
                    </p>
                    {selectedVariants.length > 0 && (
                      <p className="text-xs text-gray-500">Precio base</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Description */}
                <p className="text-gray-700 mb-4">{product.description}</p>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">Tamaño</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Obligatorio
                      </span>
                    </div>
                    <RadioGroup
                      value={selectedVariants[0]?.id || ''}
                      onValueChange={(value) => {
                        const variant = product.variants?.find(v => v.id === value)
                        if (variant) handleVariantChange(variant)
                      }}
                    >
                      {product.variants.map((variant) => (
                        <div key={variant.id} className="flex items-center space-x-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                          <RadioGroupItem value={variant.id} id={variant.id} className="w-5 h-5" />
                          <Label htmlFor={variant.id} className="flex-1 cursor-pointer py-2">
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium text-gray-900">{variant.name}</span>
                              {variant.originalPrice && variant.originalPrice > variant.price ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-sm text-gray-500 line-through">
                                    ${variant.originalPrice.toFixed(2)}
                                  </span>
                                  <span className="text-sm font-bold text-gray-900">
                                    ${variant.price.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-gray-900">
                                  ${variant.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Options */}
                {/* Opciones locales */}
                {product.options && product.options.length > 0 && (
                  <div className="space-y-3">
                    {product.options.map((option) => (
                      <div key={option.id} className="px-2">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{option.name}</h3>
                          <div className="flex items-center gap-2">
                            {option.required && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Obligatorio
                              </span>
                            )}
                            {option.choices.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {option.choices.length} opciones
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {option.type === 'checkbox' && (
                          <div className="space-y-1">
                            {option.choices.map((choice: any) => {
                              const isSelected = selectedOptions[option.id]?.some((c: any) => c.id === choice.id) || false
                              const currentCount = selectedOptions[option.id]?.length || 0
                              const isDisabled = !isSelected && option.maxSelections && currentCount >= option.maxSelections
                              
                              return (
                                <div key={choice.id} className={`flex items-center space-x-3 px-4 py-3 border-2 rounded-lg transition-colors ${
                                  isDisabled 
                                    ? 'border-gray-100 bg-gray-50 opacity-60' 
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}>
                                  <Checkbox
                                    id={choice.id}
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onCheckedChange={(checked) => 
                                      handleOptionChange(option.id, choice, checked as boolean, option.maxSelections)
                                    }
                                    className="w-5 h-5"
                                  />
                                  <Label htmlFor={choice.id} className={`flex-1 py-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <div className="flex justify-between items-center w-full">
                                      <span className="font-medium">{choice.name}</span>
                                      {choice.price > 0 ? (
                                        <span className="text-sm text-gray-600">
                                          +${choice.price.toFixed(2)}
                                        </span>
                                      ) : (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                          Gratis
                                        </span>
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Global Options */}
                {(product as any).globalOptions && (product as any).globalOptions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Opciones Adicionales</h3>
                    {(product as any).globalOptions.map((option: any) => (
                      <div key={option.id} className="px-2">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">{option.name}</h4>
                          <div className="flex items-center gap-2">
                            {option.isRequired && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Obligatorio
                              </span>
                            )}
                            {option.minSelections && (
                              <span className="text-xs text-gray-500">
                                Mínimo: {option.minSelections}
                              </span>
                            )}
                            {option.maxSelections && (
                              <span className="text-xs text-gray-500">
                                Máximo: {option.maxSelections}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {option.choices.map((choice: any) => {
                            const isSelected = selectedOptions[option.id]?.some((c: any) => c.id === choice.id) || false
                            const currentCount = selectedOptions[option.id]?.length || 0
                            const isDisabled = !isSelected && option.maxSelections && currentCount >= option.maxSelections
                            
                            return (
                              <div key={choice.id} className={`flex items-center space-x-3 px-4 py-3 border-2 rounded-lg transition-colors ${
                                isDisabled 
                                  ? 'border-gray-100 bg-gray-50 opacity-60' 
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}>
                                <Checkbox
                                  id={choice.id}
                                  checked={isSelected}
                                  disabled={isDisabled}
                                  onCheckedChange={(checked) => 
                                    handleOptionChange(option.id, choice, checked as boolean, option.maxSelections)
                                  }
                                  className="w-5 h-5"
                                />
                                <Label htmlFor={choice.id} className={`flex-1 py-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                  <div className="flex justify-between items-center w-full">
                                    <span className="font-medium">{choice.name}</span>
                                    {choice.price > 0 ? (
                                      <span className="text-sm text-gray-600">
                                        +${choice.price.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        Gratis
                                      </span>
                                    )}
                                  </div>
                                </Label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 sm:w-10 sm:h-10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 sm:w-10 sm:h-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">${calculateTotalPrice().toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer fijo */}
            <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-lg font-bold text-lg h-14"
                    onClick={handleAddToCart}
                    disabled={isAddToCartDisabled()}
                  >
                    Agregar al carrito - ${calculateTotalPrice().toFixed(2)}
                  </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}