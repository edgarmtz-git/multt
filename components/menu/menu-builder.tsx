"use client"

import { useState, useEffect } from "react"
// import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Package,
  Search,
  Filter,
  RefreshCw
} from "lucide-react"
import { CategorySection } from "./category-section"
// import { DraggableProduct } from "@/components/drag-drop/draggable-product"
// import { DragDropProvider, useDragDrop } from "@/components/drag-drop/drag-drop-provider"
import { CreateCategoryModal } from "@/components/modals/create-category-modal"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  isActive: boolean
  order: number
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

interface MenuBuilderProps {
  onAddProduct: (categoryId?: string) => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
}

function MenuBuilderContent({ 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}: MenuBuilderProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [uncategorizedProducts, setUncategorizedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)
  // const { draggedProduct, setDraggedProduct, setIsDragging } = useDragDrop()

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, productsRes] = await Promise.all([
        fetch("/api/dashboard/categories"),
        fetch("/api/dashboard/products")
      ])

      if (categoriesRes.ok && productsRes.ok) {
        const categoriesData = await categoriesRes.json()
        const productsResponse = await productsRes.json()
        
        // Extraer el array de productos de la respuesta
        const productsData = productsResponse.products || productsResponse

        setCategories(categoriesData)
        setProducts(productsData)

        // Separar productos con y sin categoría
        const withCategory = productsData.filter((p: Product) => p.category)
        const withoutCategory = productsData.filter((p: Product) => !p.category)

        setUncategorizedProducts(withoutCategory)

        // Expandir todas las categorías por defecto
        setExpandedCategories(new Set(categoriesData.map((c: Category) => c.id)))
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Mover producto entre categorías
  const moveProduct = async (productId: string, categoryId: string) => {
    try {
      const response = await fetch(`/api/dashboard/products/${productId}/category`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryId }),
      })

      if (!response.ok) {
        throw new Error("Error al mover producto")
      }

      // Actualizar el estado local
      setProducts(prev => 
        prev.map(p => 
          p.id === productId 
            ? { ...p, category: categories.find(c => c.id === categoryId) }
            : p
        )
      )

      // Actualizar productos sin categoría
      setUncategorizedProducts(prev => 
        prev.filter(p => p.id !== productId)
      )

      toast.success("Producto movido exitosamente")
    } catch (error) {
      console.error("Error moving product:", error)
      toast.error("Error al mover el producto")
    }
  }

  // Toggle activo/inactivo
  const toggleProductActive = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/dashboard/products/${productId}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        throw new Error("Error al cambiar estado del producto")
      }

      // Actualizar el estado local
      setProducts(prev => 
        prev.map(p => 
          p.id === productId 
            ? { ...p, isActive }
            : p
        )
      )

      setUncategorizedProducts(prev => 
        prev.map(p => 
          p.id === productId 
            ? { ...p, isActive }
            : p
        )
      )

      toast.success(`Producto ${isActive ? 'activado' : 'desactivado'} exitosamente`)
    } catch (error) {
      console.error("Error toggling product active status:", error)
      toast.error("Error al cambiar estado del producto")
    }
  }

  // Eliminar producto
  const deleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/dashboard/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar producto")
      }

      // Actualizar el estado local
      setProducts(prev => prev.filter(p => p.id !== productId))
      setUncategorizedProducts(prev => prev.filter(p => p.id !== productId))

      toast.success("Producto eliminado exitosamente")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar el producto")
    }
  }

  // Manejar drag and drop - DESACTIVADO
  // const handleDragStart = (event: DragStartEvent) => {
  //   const { active } = event
  //   setDraggedProduct(active.data.current?.product)
  //   setIsDragging(true)
  // }

  // const handleDragEnd = (event: DragEndEvent) => {
  //   const { active, over } = event
    
  //   if (over && active.id !== over.id) {
  //     const productId = active.id as string
  //     const categoryId = over.id as string
      
  //     moveProduct(productId, categoryId)
  //   }

  //   setDraggedProduct(null)
  //   setIsDragging(false)
  // }

  // Toggle expandir/colapsar categoría
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Obtener productos por categoría
  const getProductsByCategory = (categoryId: string) => {
    return products.filter(p => p.category?.id === categoryId)
  }

  // Filtrar categorías y productos
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUncategorizedProducts = uncategorizedProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Constructor de Menú</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Constructor de Menú</h2>
            <p className="text-muted-foreground">
              Organiza tus productos arrastrando entre categorías
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => loadData()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button 
              onClick={() => setShowCreateCategoryModal(true)} 
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
            <Button onClick={() => onAddProduct()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Productos</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Categorías</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Sin Categoría</p>
                  <p className="text-2xl font-bold">{uncategorizedProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar categorías o productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorías */}
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              products={getProductsByCategory(category.id)}
              isExpanded={expandedCategories.has(category.id)}
              onToggleExpanded={() => toggleCategory(category.id)}
              onAddProduct={(categoryId) => onAddProduct(categoryId)}
              onEditProduct={onEditProduct}
              onDeleteProduct={onDeleteProduct}
              onToggleProductActive={toggleProductActive}
              onMoveProduct={moveProduct}
            />
          ))}
        </div>

        {/* Productos sin categoría */}
        {filteredUncategorizedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos sin Categoría
                <Badge variant="secondary">
                  {filteredUncategorizedProducts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {filteredUncategorizedProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {/* Imagen del producto */}
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Estados */}
                    <div className="flex items-center gap-2">
                      {product.isActive && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          VISIBLE
                        </Badge>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditProduct(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProductActive(product.id, !product.isActive)}
                      >
                        {product.isActive ? "Ocultar" : "Mostrar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredCategories.length === 0 && filteredUncategorizedProducts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No se encontraron resultados" : "No hay productos"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Intenta con otros términos de búsqueda"
                  : "Crea tu primer producto para comenzar"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => onAddProduct()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Producto
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal para crear categoría */}
      <CreateCategoryModal
        isOpen={showCreateCategoryModal}
        onClose={() => setShowCreateCategoryModal(false)}
        onSuccess={() => {
          loadData()
          setShowCreateCategoryModal(false)
        }}
      />
    </>
  )
}

export function MenuBuilder(props: MenuBuilderProps) {
  return <MenuBuilderContent {...props} />
}