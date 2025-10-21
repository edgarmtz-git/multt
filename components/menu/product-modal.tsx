'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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

  // Preseleccionar la variante más pequeña/barata automáticamente
  React.useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      // Ordenar variantes por precio (ascendente) y tomar la primera
      const sortedVariants = [...product.variants].sort((a, b) => a.price - b.price)
      setSelectedVariants([sortedVariants[0]])
    }
  }, [product.variants])

  if (!isOpen) return null

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
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full h-screen md:h-auto md:max-w-3xl lg:max-w-4xl xl:max-w-5xl md:max-h-[90vh] md:rounded-lg overflow-hidden flex flex-col shadow-2xl">
        {/* Content scrolleable - incluye imagen y toda la información */}
        <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth pb-safe">
          {/* Header con imagen grande */}
          <div className="relative">
            {product.imageUrl ? (
              <div className="h-64 sm:h-80 bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-64 sm:h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-8xl">🍽️</span>
              </div>
            )}
            {/* Botón de cerrar con mejor visibilidad */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 hover:bg-white rounded-full p-2.5 md:p-2 shadow-lg z-10"
              onClick={onClose}
            >
              <X className="h-5 w-5 md:h-4 md:w-4 text-gray-900" />
            </Button>
          </div>

          {/* Información del producto */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 pr-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{product.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ${selectedVariants.length > 0 ? selectedVariants[0].price.toFixed(2) : product.price.toFixed(2)}
                </p>
                {selectedVariants.length > 0 && (
                  <p className="text-xs text-gray-500">Precio base</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Description */}
            <p className="text-gray-700 mb-4">{product.description}</p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Tamaño</h3>
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
                    <div key={variant.id} className="flex items-center space-x-3 p-4 sm:p-5 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors min-h-[60px]">
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
            {product.options && product.options.map((option) => (
              <div key={option.id} className="mb-6">
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {option.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Tag de obligatorio */}
                      {option.required && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          (selectedOptions[option.id]?.length || 0) > 0
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Obligatorio
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Renderizar según el tipo de opción */}
                {option.type === 'text' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Escribe tu respuesta..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        // Para opciones de texto, almacenamos la respuesta como una "elección" temporal
                        const textChoice = {
                          id: 'text-response',
                          name: e.target.value,
                          price: 0,
                          isDefault: false
                        }
                        if (e.target.value.trim()) {
                          setSelectedOptions(prev => ({ ...prev, [option.id]: [textChoice] }))
                        } else {
                          setSelectedOptions(prev => {
                            const newOptions = { ...prev }
                            delete newOptions[option.id]
                            return newOptions
                          })
                        }
                      }}
                    />
                  </div>
                )}

                {option.type === 'number' && (
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Ingresa un número..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        const numberChoice = {
                          id: 'number-response',
                          name: e.target.value,
                          price: 0,
                          isDefault: false
                        }
                        if (e.target.value.trim()) {
                          setSelectedOptions(prev => ({ ...prev, [option.id]: [numberChoice] }))
                        } else {
                          setSelectedOptions(prev => {
                            const newOptions = { ...prev }
                            delete newOptions[option.id]
                            return newOptions
                          })
                        }
                      }}
                    />
                  </div>
                )}

                {option.type === 'date' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        const dateChoice = {
                          id: 'date-response',
                          name: e.target.value,
                          price: 0,
                          isDefault: false
                        }
                        if (e.target.value) {
                          setSelectedOptions(prev => ({ ...prev, [option.id]: [dateChoice] }))
                        } else {
                          setSelectedOptions(prev => {
                            const newOptions = { ...prev }
                            delete newOptions[option.id]
                            return newOptions
                          })
                        }
                      }}
                    />
                  </div>
                )}

                {option.type === 'media' && (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        Sube una imagen o archivo
                      </p>
                      <input
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        className="hidden"
                        id={`media-${option.id}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const mediaChoice = {
                              id: 'media-response',
                              name: file.name,
                              price: 0,
                              isDefault: false
                            }
                            setSelectedOptions(prev => ({ ...prev, [option.id]: [mediaChoice] }))
                          }
                        }}
                      />
                      <button
                        onClick={() => document.getElementById(`media-${option.id}`)?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Seleccionar archivo
                      </button>
                    </div>
                  </div>
                )}

                {(option.type === 'checkbox' || option.type === 'select') && option.choices.length > 0 && (
                  <div className="space-y-3">
                    {option.type === 'select' ? (
                      // Opción de selección única (RadioGroup)
                      <RadioGroup
                        value={selectedOptions[option.id]?.[0]?.id || ''}
                        onValueChange={(value) => {
                          const choice = option.choices.find(c => c.id === value)
                          if (choice) {
                            setSelectedOptions(prev => ({ ...prev, [option.id]: [choice] }))
                          }
                        }}
                      >
                        {option.choices.map((choice) => (
                          <div key={choice.id} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <RadioGroupItem value={choice.id} id={choice.id} />
                            <Label htmlFor={choice.id} className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center w-full">
                                <span className="font-medium">{choice.name}</span>
                                {choice.price > 0 ? (
                                  <span className="text-sm font-bold text-gray-900">
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
                        ))}
                      </RadioGroup>
                    ) : (
                      // Opción de casillas múltiples (Checkbox)
                      option.choices.map((choice) => (
                        <div key={choice.id} className="flex items-center space-x-3 p-4 sm:p-5 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors min-h-[60px]">
                          <Checkbox
                            id={choice.id}
                            checked={selectedOptions[option.id]?.some(c => c.id === choice.id) || false}
                            onCheckedChange={(checked) =>
                              handleOptionChange(option.id, choice, checked as boolean, (option as any).maxSelections)
                            }
                            className="w-5 h-5"
                          />
                          <Label htmlFor={choice.id} className="flex-1 cursor-pointer py-2">
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium">{choice.name}</span>
                              {choice.price > 0 ? (
                                <span className="text-sm font-bold text-gray-900">
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
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Opciones globales */}
            {(product as any).globalOptions && (product as any).globalOptions.map((option: any) => (
              <div key={option.id} className="mb-6">
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {option.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Tag de obligatorio */}
                      {option.isRequired && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          (selectedOptions[option.id]?.length || 0) >= (option.minSelections || 1)
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Obligatorio
                        </span>
                      )}
                      {/* Indicador de progreso */}
                      {option.maxSelections && (
                        <span className="text-sm text-gray-500">
                          {(selectedOptions[option.id]?.length || 0)}/{option.maxSelections}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                
                {option.type === 'select' ? (
                  // Opción de selección única (Radio)
                  <div className="space-y-3">
                    <RadioGroup
                      value={selectedOptions[option.id]?.[0]?.id || ''}
                      onValueChange={(value) => {
                        const choice = option.choices.find((c: any) => c.id === value)
                        if (choice) {
                          setSelectedOptions(prev => ({
                            ...prev,
                            [option.id]: [choice]
                          }))
                        }
                      }}
                    >
                      {option.choices.map((choice: any) => (
                        <div key={choice.id} className="flex items-center space-x-3 p-4 sm:p-5 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors min-h-[60px]">
                          <RadioGroupItem value={choice.id} id={choice.id} className="w-5 h-5" />
                          <Label htmlFor={choice.id} className="flex-1 cursor-pointer py-2">
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium">{choice.name}</span>
                              {choice.price > 0 ? (
                                <span className="text-sm font-bold text-gray-900">
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
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  // Opción de casillas múltiples (Checkbox)
                  <div className="space-y-3">
                    {option.choices.map((choice: any) => {
                    const isSelected = selectedOptions[option.id]?.some((c: any) => c.id === choice.id) || false
                    const currentCount = selectedOptions[option.id]?.length || 0
                    const isDisabled = !isSelected && option.maxSelections && currentCount >= option.maxSelections
                    
                    return (
                      <div key={choice.id} className={`flex items-center space-x-3 p-4 sm:p-5 border-2 rounded-lg transition-colors min-h-[60px] ${
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

            {/* Controles de cantidad */}
            <div className="mt-6 p-4 sm:p-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-12 h-12 sm:w-10 sm:h-10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 sm:w-10 sm:h-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg sm:text-xl font-bold text-gray-900">${calculateTotalPrice().toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer fijo - solo botón de agregar */}
        <div className="p-4 sm:p-6 border-t bg-white flex-shrink-0">
          <Button
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 sm:py-3 rounded-lg font-bold text-base sm:text-lg min-h-[56px]"
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled()}
          >
            Agregar al carrito - ${calculateTotalPrice().toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  )
}
