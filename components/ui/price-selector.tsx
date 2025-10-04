"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  Zap, 
  Minus, 
  Plus,
  DollarSign
} from "lucide-react"

interface ProductVariant {
  id: string
  name: string
  value: string // Para colores: "#FF0000", tamaños: "CH", sabores: "vanilla"
  price: number
}

interface PriceSelectorProps {
  productName: string
  hasVariants: boolean
  variantType?: string
  variantLabel?: string
  basePrice?: number
  variants?: ProductVariant[]
  onAddToCart: (variant?: ProductVariant, quantity?: number) => void
}

export function PriceSelector({ 
  productName, 
  hasVariants, 
  variantType = 'size',
  variantLabel = 'Tamaño',
  basePrice = 0, 
  variants = [], 
  onAddToCart 
}: PriceSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  )
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      return // No se puede agregar sin seleccionar variante
    }
    
    onAddToCart(selectedVariant || undefined, quantity)
  }

  const canAddToCart = hasVariants ? selectedVariant !== null : basePrice > 0

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {!hasVariants ? (
          // Precio único
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                ${basePrice.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          // Variantes de precio
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Selecciona el {variantLabel.toLowerCase()}:</p>
            </div>
            
            <div className="grid gap-2">
              {variants.map((variant) => (
                <Card
                  key={variant.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedVariant?.id === variant.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedVariant?.id === variant.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedVariant?.id === variant.id && (
                            <Check className="h-2 w-2 text-white" />
                          )}
                        </div>
                        
                        {/* Visual indicator para colores */}
                        {variantType === 'color' && (
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: variant.value }}
                          />
                        )}
                        
                        <div>
                          <p className="font-medium">{variant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {variantType === 'color' ? `Código: ${variant.value}` :
                             variantType === 'size' ? `Tamaño: ${variant.value}` :
                             variantType === 'flavor' ? `Sabor: ${variant.value}` :
                             variantType === 'style' ? `Estilo: ${variant.value}` :
                             `Valor: ${variant.value}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          ${variant.price.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedVariant && (
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Precio seleccionado:</p>
                <p className="text-xl font-bold text-primary">
                  ${selectedVariant.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedVariant.name} ({selectedVariant.value})
                </p>
              </div>
            )}
          </div>
        )}

        {/* Selector de cantidad */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Cantidad:</span>
            <Badge variant="outline" className="px-3 py-1">
              {quantity}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Botón agregar al carrito */}
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar al Carrito
          {hasVariants && selectedVariant && (
            <span className="ml-2 text-xs opacity-75">
              ${(selectedVariant.price * quantity).toFixed(2)}
            </span>
          )}
          {!hasVariants && basePrice > 0 && (
            <span className="ml-2 text-xs opacity-75">
              ${(basePrice * quantity).toFixed(2)}
            </span>
          )}
        </Button>

        {hasVariants && !selectedVariant && (
          <p className="text-xs text-center text-muted-foreground">
            Selecciona un {variantLabel.toLowerCase()} para continuar
          </p>
        )}
      </CardContent>
    </Card>
  )
}
