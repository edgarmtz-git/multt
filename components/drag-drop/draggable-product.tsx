"use client"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  GripVertical, 
  Package, 
  Edit, 
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  isActive: boolean
  hasVariants: boolean
  category?: {
    id: string
    name: string
    color: string
    icon?: string
  }
  variants?: Array<{
    id: string
    name: string
    price: number
  }>
  _count?: {
    variants: number
  }
}

interface DraggableProductProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onToggleActive?: (productId: string, isActive: boolean) => void
  className?: string
}

export function DraggableProduct({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleActive,
  className 
}: DraggableProductProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: product.id,
    data: {
      product,
    },
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-all duration-200",
        isDragging && "opacity-50 scale-105 shadow-lg z-50",
        className
      )}
    >
      <Card
        className={cn(
          "cursor-grab active:cursor-grabbing",
          !product.isActive && "opacity-60"
        )}
        {...attributes}
        {...listeners}
      >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {/* Handle de arrastre */}
          <div className="flex-shrink-0">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>

          {/* Imagen del producto */}
          <div className="flex-shrink-0">
            {product.imageUrl ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
              {!product.isActive && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  <EyeOff className="h-2 w-2 mr-1" />
                  Inactivo
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-green-600">
                ${product.price.toFixed(2)}
              </span>
              {product.hasVariants && product._count?.variants && (
                <span>• {product._count.variants} variantes</span>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex-shrink-0 flex gap-1">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(product)
                }}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onToggleActive && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleActive(product.id, !product.isActive)
                }}
                className="h-7 w-7 p-0"
              >
                {product.isActive ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(product.id)
                }}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
