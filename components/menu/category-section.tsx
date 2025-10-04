"use client"

import { useDroppable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Package,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { DraggableProduct } from "@/components/drag-drop/draggable-product"
import { DroppableArea } from "@/components/drag-drop/droppable-area"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  isActive: boolean
  _count: {
    products: number
  }
}

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

interface CategorySectionProps {
  category: Category
  products: Product[]
  isExpanded: boolean
  onToggleExpanded: () => void
  onAddProduct: (categoryId: string) => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
  onToggleProductActive: (productId: string, isActive: boolean) => void
  onMoveProduct: (productId: string, categoryId: string) => Promise<void>
}

export function CategorySection({
  category,
  products,
  isExpanded,
  onToggleExpanded,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductActive,
  onMoveProduct
}: CategorySectionProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: category.id,
  })

  return (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: category.color }}
            >
              {category.icon || "📁"}
            </div>
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              {category.description && (
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Package className="h-3 w-3 mr-1" />
              {products.length} productos
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onAddProduct(category.id)
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div
            ref={setNodeRef}
            className={cn(
              "min-h-[100px] p-4 rounded-lg border-2 border-dashed transition-all duration-200",
              isOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  No hay productos en esta categoría
                </p>
                <p className="text-xs text-muted-foreground">
                  Arrastra productos aquí o haz clic en "Agregar"
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {products.map((product) => (
                  <DraggableProduct
                    key={product.id}
                    product={product}
                    onEdit={onEditProduct}
                    onDelete={onDeleteProduct}
                    onToggleActive={onToggleProductActive}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
