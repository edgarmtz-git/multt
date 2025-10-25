"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { componentClasses } from "@/lib/design-system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { ProductImage } from "@/components/ui/optimized-image"
import { LazyLoad } from "@/components/ui/lazy-load"
import { 
  HelpCircle, 
  Upload, 
  Edit3, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Tag,
  FolderPlus,
  FolderMinus,
  Trash2,
  Package
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  imageUrl?: string
  isActive: boolean
  isNew?: boolean
  sku?: string
  variants?: ProductVariant[]
  createdAt: string
}

interface ProductVariant {
  id: string
  name: string
  price: number
  sku: string
}

export default function ProductsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [totalProducts, setTotalProducts] = useState(0)

  // Cargar productos
  useEffect(() => {
    loadProducts()
  }, [currentPage, itemsPerPage, searchTerm])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/products?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`)
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setTotalProducts(data.total || 0)
      } else {
        toast.error("Error al cargar productos")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  // Manejar selección de productos
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
    setSelectAll(!selectAll)
  }

  // Actualizar selectAll cuando cambien los productos seleccionados
  useEffect(() => {
    setSelectAll(selectedProducts.length === products.length && products.length > 0)
  }, [selectedProducts, products])

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset a la primera página
  }

  // Manejar paginación
  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Manejar acciones
  const handleImport = () => {
    toast.info("Funcionalidad de importación pendiente de implementar")
  }

  const handleBulkEdit = () => {
    if (selectedProducts.length === 0) {
      toast.error("Selecciona al menos un producto")
      return
    }
    toast.info("Funcionalidad de edición masiva pendiente de implementar")
  }

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) {
      toast.error("Selecciona al menos un producto")
      return
    }

    switch (action) {
      case 'duplicate':
        toast.info("Funcionalidad de duplicar pendiente de implementar")
        break
      case 'hide':
        handleBulkToggleVisibility(false)
        break
      case 'show':
        handleBulkToggleVisibility(true)
        break
      case 'addOption':
        toast.info("Funcionalidad de añadir opción pendiente de implementar")
        break
      case 'addToCategory':
        toast.info("Funcionalidad de añadir a categoría pendiente de implementar")
        break
      case 'addTag':
        toast.info("Funcionalidad de añadir etiqueta pendiente de implementar")
        break
      case 'removeFromCategory':
        toast.info("Funcionalidad de quitar de categoría pendiente de implementar")
        break
      case 'removeTag':
        toast.info("Funcionalidad de quitar etiqueta pendiente de implementar")
        break
      case 'deleteOptions':
        if (confirm("¿Estás seguro de que quieres eliminar las opciones de los productos seleccionados?")) {
          toast.info("Funcionalidad de eliminar opciones pendiente de implementar")
        }
        break
      case 'deleteProducts':
        if (confirm("¿Estás seguro de que quieres eliminar los productos seleccionados? Esta acción no se puede deshacer.")) {
          handleBulkDelete()
        }
        break
      default:
        toast.error("Acción no reconocida")
    }
  }

  const handleBulkToggleVisibility = async (isVisible: boolean) => {
    try {
      const promises = selectedProducts.map(productId =>
        fetch(`/api/dashboard/products/${productId}/toggle-active`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: isVisible })
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedProducts.length} productos ${isVisible ? 'mostrados' : 'ocultados'} exitosamente`)
      setSelectedProducts([])
      loadProducts()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar los productos")
    }
  }

  const handleBulkDelete = async () => {
    try {
      const promises = selectedProducts.map(productId =>
        fetch(`/api/dashboard/products/${productId}`, {
          method: 'DELETE'
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedProducts.length} productos eliminados exitosamente`)
      setSelectedProducts([])
      loadProducts()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar los productos")
    }
  }

  const handleExport = () => {
    toast.info("Funcionalidad de exportación pendiente de implementar")
  }

  const handleAddProduct = () => {
    router.push("/dashboard/products/new")
  }

  const handleEditProduct = (product: Product) => {
    router.push(`/dashboard/products/${product.id}`)
  }

  const handleToggleProductStatus = async (productId: string) => {
    try {
      const response = await fetch(`/api/dashboard/products/${productId}/toggle-active`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success("Estado del producto actualizado")
        loadProducts()
      } else {
        toast.error("Error al actualizar el producto")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar el producto")
    }
  }

  if (!session) {
    return <div>Cargando...</div>
  }

  return (
    <DashboardLayout 
      user={{
        name: session.user?.name || "Usuario",
        email: session.user?.email || "",
        avatar: session.user?.avatar || undefined
      }}
    >
      <div className="max-w-7xl mx-auto p-6">
        <div className={componentClasses.formContainer}>
          {/* Header */}
          <div className={componentClasses.pageHeader}>
            <div>
              <h1 className={componentClasses.pageTitle}>Productos</h1>
              <p className="text-muted-foreground">Gestiona los productos de tu menú</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleImport}
                className={componentClasses.actionButton}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBulkEdit}
                className={componentClasses.actionButton}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edición masiva
              </Button>
              <Button 
                onClick={handleAddProduct}
                className={componentClasses.actionButton}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir producto
              </Button>
            </div>
          </div>

        {/* Barra de búsqueda y acciones */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre de producto, nombre de variante o SKU"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de productos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              {selectedProducts.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-auto p-2">
                      <span className="font-semibold">
                        Acciones ({selectedProducts.length} seleccionados)
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => handleBulkAction('duplicate')}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('hide')}>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ocultar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('show')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Mostrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('addOption')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir opción
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('addToCategory')}>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Añadir a la categoría
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('addTag')}>
                      <Tag className="h-4 w-4 mr-2" />
                      Añadir etiqueta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('removeFromCategory')}>
                      <FolderMinus className="h-4 w-4 mr-2" />
                      Quitar de la categoría
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('removeTag')}>
                      <Tag className="h-4 w-4 mr-2" />
                      Quitar etiqueta
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleBulkAction('deleteOptions')}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar opciones
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleBulkAction('deleteProducts')}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar productos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <CardTitle>Productos</CardTitle>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando productos...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron productos
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleEditProduct(product)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                      />
                    </div>
                    
                    {/* Imagen del producto */}
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <ProductImage
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.sku && `SKU: ${product.sku}`}
                      </p>
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                      <p className="font-medium">${product.price.toFixed(2)}</p>
                    </div>

                    {/* Estados */}
                    <div className="flex items-center gap-2">
                      {product.isActive && (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          VISIBLE
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total {totalProducts}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Mostrar</span>
              <Input
                type="number"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-20 h-8"
                min="1"
                max="100"
              />
              <span className="text-sm">por página</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
