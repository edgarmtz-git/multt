"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Menu as MenuIcon, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  DollarSign,
  Eye,
  Palette,
  Ruler,
  Coffee,
  Shirt,
  Sparkles
} from "lucide-react"
import { ProductFormModal } from "@/components/modals/product-form-modal"
import { toast } from "sonner"

interface ProductVariant {
  id: string
  name: string
  value: string
  price: number
  isActive: boolean
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  hasVariants: boolean
  variantType: string | null
  variantLabel: string | null
  variants: ProductVariant[]
  createdAt: string
}

interface MenuContentProps {
  initialProducts: Product[]
}

export function MenuContent({ initialProducts }: MenuContentProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleProductCreated = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard/products')
      if (response.ok) {
        const updatedProducts = await response.json()
        setProducts(updatedProducts)
      }
    } catch (error) {
      console.error('Error refreshing products:', error)
      toast.error('Error al actualizar la lista de productos')
    } finally {
      setIsLoading(false)
    }
  }

  const getVariantIcon = (variantType: string | null) => {
    switch (variantType) {
      case 'size': return Ruler
      case 'color': return Palette
      case 'flavor': return Coffee
      case 'style': return Shirt
      default: return Sparkles
    }
  }

  const getPriceRange = (product: Product) => {
    if (!product.hasVariants || product.variants.length === 0) {
      return `$${product.price.toFixed(2)}`
    }
    
    const prices = product.variants.map(v => v.price).filter(p => p > 0)
    if (prices.length === 0) return 'Sin precio'
    
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    
    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Menú</h2>
            <p className="text-muted-foreground">
              Administra los productos de tu menú digital
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                En tu menú
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Variantes</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => p.hasVariants).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Productos con variantes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <MenuIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(products.map(p => p.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Diferentes categorías
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Productos del Menú</CardTitle>
            <CardDescription>
              Lista de todos los productos disponibles en tu menú digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <MenuIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza agregando productos a tu menú digital
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Producto
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const VariantIcon = getVariantIcon(product.variantType)
                  
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {product.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Precio:</span>
                            <span className="text-lg font-bold">{getPriceRange(product)}</span>
                          </div>
                          
                          {product.hasVariants && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <VariantIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{product.variantLabel}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {product.variants.slice(0, 3).map((variant) => (
                                  <Badge key={variant.id} variant="secondary" className="text-xs">
                                    {variant.name}
                                  </Badge>
                                ))}
                                {product.variants.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{product.variants.length - 3} más
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </>
  )
}


