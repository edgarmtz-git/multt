"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { 
  ArrowLeft, 
  Upload, 
  Wand2, 
  Search, 
  GripVertical, 
  Trash2,
  Plus,
  X
} from "lucide-react"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Product {
  id: string
  name: string
  imageUrl?: string
  isActive: boolean
  order: number
}

interface CategoryFormData {
  name: string
  description: string
  isActive: boolean
  imageUrl?: string
  isVisibleInStore: boolean
  products: Product[]
}

interface AdvancedCategoryFormProps {
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
  isLoading?: boolean
  initialData?: Partial<CategoryFormData>
  isEditing?: boolean
}

// Componente para productos arrastrables
function SortableProductItem({ 
  product, 
  onRemove, 
  onToggleVisibility 
}: { 
  product: Product
  onRemove: (id: string) => void
  onToggleVisibility: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-3 bg-white border rounded-lg shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded mr-3"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex items-center gap-3 flex-1">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-8 h-8 rounded object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">📦</span>
          </div>
        )}
        
        <span className="font-medium flex-1">{product.name}</span>
        
        <Badge 
          variant={product.isActive ? "default" : "secondary"}
          className={product.isActive ? "bg-green-100 text-green-800" : ""}
        >
          {product.isActive ? "VISIBLE" : "OCULTO"}
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVisibility(product.id)}
          className="text-xs"
        >
          {product.isActive ? "Ocultar" : "Mostrar"}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(product.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function AdvancedCategoryForm({ 
  onSubmit, 
  onCancel, 
  onDelete,
  isLoading = false, 
  initialData,
  isEditing = false
}: AdvancedCategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive ?? true,
    imageUrl: initialData?.imageUrl || "",
    isVisibleInStore: initialData?.isVisibleInStore ?? false,
    products: initialData?.products || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>("")

  // Configurar sensores para drag & drop
  const sensors = [
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  ]

  // Cargar productos disponibles
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/dashboard/products')
        if (response.ok) {
          const data = await response.json()
          const products = data.products || data // Extraer el array de productos
          // Filtrar productos que no están ya en la categoría
          const filteredProducts = products.filter((product: Product) => 
            !formData.products.some(p => p.id === product.id)
          )
          setAvailableProducts(filteredProducts)
        }
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }
    
    if (showProductSearch) {
      loadProducts()
    }
  }, [showProductSearch, formData.products])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre de la categoría es requerido"
    }

    if (formData.name.length > 50) {
      newErrors.name = "El nombre no puede tener más de 50 caracteres"
    }

    if (formData.description.length > 100) {
      newErrors.description = "La descripción no puede tener más de 100 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario")
      return
    }

    try {
      await onSubmit(formData)
      toast.success(isEditing ? "Categoría actualizada exitosamente" : "Categoría creada exitosamente")
    } catch (error) {
      toast.error("Error al guardar la categoría")
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      try {
        await onDelete()
        toast.success("Categoría eliminada exitosamente")
      } catch (error) {
        toast.error("Error al eliminar la categoría")
        console.error(error)
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no debe exceder 10MB")
        return
      }
      
      // Aquí implementarías la subida real del archivo
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({ ...formData, imageUrl: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateImage = () => {
    // TODO: Implementar generación automática de imagen
    toast.info("Funcionalidad de generación de imagen pendiente de implementar")
  }

  const handleAddProduct = (product: Product) => {
    setFormData({
      ...formData,
      products: [...formData.products, { ...product, order: formData.products.length + 1 }]
    })
    setSearchTerm("")
    setSelectedProductId("")
    setShowProductSearch(false)
  }

  const handleRemoveProduct = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.id !== productId)
    })
  }

  const handleToggleProductVisibility = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.map(p => 
        p.id === productId ? { ...p, isActive: !p.isActive } : p
      )
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setFormData({
        ...formData,
        products: arrayMove(
          formData.products,
          formData.products.findIndex(p => p.id === active.id),
          formData.products.findIndex(p => p.id === over?.id)
        ).map((product, index) => ({ ...product, order: index + 1 }))
      })
    }
  }

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Categoría</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Detalles de la categoría */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre"
                  className={errors.name ? "border-red-500" : ""}
                  maxLength={50}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilidad *</Label>
                <Select
                  value={formData.isActive ? "visible" : "hidden"}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === "visible" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible</SelectItem>
                    <SelectItem value="hidden">Oculto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="La descripción debe tener menos de 100 caracteres"
                className={errors.description ? "border-red-500" : ""}
                maxLength={100}
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/100 caracteres
              </p>
            </div>

            {/* Upload de imagen */}
            <div className="space-y-2">
              <Label>Imagen</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {formData.imageUrl ? (
                  <div className="space-y-2">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-20 h-20 mx-auto rounded object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remover imagen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Arrastre un archivo aquí o haga clic para seleccionarlo
                    </p>
                    <p className="text-xs text-gray-500">
                      El archivo no debe exceder 10mb. La proporción recomendada es 1:1.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Subir imagen
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateImage}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección de productos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Productos
                <Badge variant="secondary">TOTAL {formData.products.length}</Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Select de productos con autocompletado */}
            <div className="space-y-2">
              <Label>Añadir producto</Label>
              <Popover open={showProductSearch} onOpenChange={setShowProductSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showProductSearch}
                    className="w-full justify-between"
                  >
                    {selectedProductId 
                      ? availableProducts.find(product => product.id === selectedProductId)?.name
                      : "Buscar producto"
                    }
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Buscar producto..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No se encontraron productos.</CommandEmpty>
                      <CommandGroup>
                        {filteredProducts.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={() => {
                              setSelectedProductId(product.id)
                              handleAddProduct(product)
                            }}
                          >
                            <div className="flex items-center gap-3 w-full">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">📦</span>
                                </div>
                              )}
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Lista de productos asociados */}
            {formData.products.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.products.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {formData.products.map((product) => (
                      <SortableProductItem
                        key={product.id}
                        product={product}
                        onRemove={handleRemoveProduct}
                        onToggleVisibility={handleToggleProductVisibility}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Toggle de visibilidad en tienda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="store-visibility">Añadir a la tienda</Label>
                <p className="text-sm text-muted-foreground">
                  Hacer visible esta categoría en la tienda pública
                </p>
              </div>
              <Switch
                id="store-visibility"
                checked={formData.isVisibleInStore}
                onCheckedChange={(checked) => setFormData({ ...formData, isVisibleInStore: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
          {isEditing && onDelete && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              Eliminar
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
