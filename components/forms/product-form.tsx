'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  Wand2,
  Package, 
  Tag,
  Settings,
  MessageCircle,
  X,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  Target,
  Layers
} from 'lucide-react'
import { toast } from 'sonner'
import { ReorderVariantsModal } from '@/components/modals/reorder-variants-modal'

interface ProductVariant {
  id?: string
  name: string
  price: number
  originalPrice?: number
  sku?: string
  weight?: number
  imageUrl?: string
  stock?: number
  isExpanded?: boolean
}

interface ProductOption {
  id?: string
  name: string
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'media'
  isRequired: boolean
  enableQuantity: boolean
  choices: ProductOptionChoice[]
}

interface ProductOptionChoice {
  id?: string
  name: string
  price: number
}

interface GlobalOption {
  id: string
  name: string
  type: string
  description?: string
  maxSelections?: number
  minSelections?: number
  isRequired: boolean
  choices: Array<{
    id: string
    name: string
    price: number
  }>
}

interface ProductGlobalOption {
  globalOptionId: string
  maxSelections?: number
  minSelections?: number
  isRequired: boolean
}

interface ProductFormData {
  name: string
  isActive: boolean
  type: 'physical' | 'digital'
  categoryId: string
  sku: string
  weight: number
  price: number
  originalPrice?: number
  description: string
  imageUrl?: string
  deliveryMethods: {
    pickup: boolean
    shipping: boolean
  }
  variants: ProductVariant[]
  options: ProductOption[]
  globalOptions: ProductGlobalOption[]
  inventory: {
    trackQuantity: boolean
    stock: number
    dailyCapacity: boolean
    maxDailySales?: number
    maxOrderQuantity: boolean
    maxQuantity?: number
    minOrderQuantity: boolean
    minQuantity?: number
  }
  tags: string[]
  // Campos adicionales de precios
  pricing: {
    costPrice?: number
    wholesalePrice?: number
    bulkDiscount?: {
      enabled: boolean
      minQuantity: number
      discountPercentage: number
    }
    taxRate?: number
    commission?: number
  }
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  isEditing?: boolean
  onSave?: (data: ProductFormData) => void
  onCancel?: () => void
  standalone?: boolean // Nueva prop para controlar si incluye DashboardLayout
}

export function ProductForm({ 
  initialData, 
  isEditing = false, 
  onSave, 
  onCancel,
  standalone = true // Por defecto incluye DashboardLayout
}: ProductFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  
  // Debug: Log initial data (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 ProductForm initialData:', initialData)
  }

  // Cast to any to avoid type errors with Prisma-generated types
  const data = initialData as any

  const [formData, setFormData] = useState<ProductFormData>({
    name: data?.name || '',
    isActive: data?.isActive !== undefined ? data.isActive : true,
    type: data?.type || 'physical',
    sku: data?.sku || '',
    weight: data?.weight || 0,
    price: data?.price || 0,
    originalPrice: data?.originalPrice || 0,
    description: data?.description || '',
    imageUrl: data?.imageUrl || data?.images?.[0]?.url || '',
    deliveryMethods: {
      pickup: data?.allowPickup ?? true,
      shipping: data?.allowShipping ?? true
    },
    variants: (data?.variants && Array.isArray(data.variants)) ? data.variants.map((v: any) => ({
      id: v?.id,
      name: v?.name || '',
      price: Number(v?.price) || 0,
      originalPrice: Number(v?.originalPrice) || 0,
      sku: v?.value || v?.sku || '',
      weight: Number(v?.weight) || 0,
      imageUrl: v?.imageUrl || ''
    })) : [],
    options: (initialData?.options && Array.isArray(data?.options)) ? data?.options.map((o: any) => ({
      id: o?.id,
      name: o?.name || '',
      type: o?.type || 'text',
      isRequired: Boolean(o?.isRequired),
      enableQuantity: Boolean(o?.enableQuantity),
      choices: (o?.choices && Array.isArray(o.choices)) ? o.choices.map((c: any) => ({
        id: c?.id,
        name: c?.name || '',
        price: Number(c?.price) || 0
      })) : []
    })) : [],
    inventory: {
      trackQuantity: data?.trackQuantity || false,
      stock: initialData?.inventory?.stock || 0,
      dailyCapacity: initialData?.inventory?.dailyCapacity || false,
      maxDailySales: initialData?.inventory?.maxDailySales || undefined,
      maxOrderQuantity: initialData?.inventory?.maxOrderQuantity || false,
      maxQuantity: initialData?.inventory?.maxQuantity || undefined,
      minOrderQuantity: initialData?.inventory?.minOrderQuantity || false,
      minQuantity: initialData?.inventory?.minQuantity || undefined
    },
    tags: initialData?.tags || [],
    // Mapear categoryProducts a categoryId
    categoryId: (initialData as any)?.categoryProducts?.[0]?.category?.id || (isEditing ? 'no-category' : ''),
    // Opciones globales
    globalOptions: (() => {
      if (initialData?.globalOptions && Array.isArray(data?.globalOptions)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Using globalOptions:', data?.globalOptions)
        }
        return data?.globalOptions.map((go: any) => ({
          globalOptionId: go.globalOptionId || go.id,
          maxSelections: go.maxSelections,
          minSelections: go.minSelections,
          isRequired: go.isRequired || false
        }))
      } else if ((initialData as any)?.productGlobalOptions && Array.isArray(data?.productGlobalOptions)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Using productGlobalOptions:', data?.productGlobalOptions)
        }
        return data?.productGlobalOptions.map((pgo: any) => ({
          globalOptionId: pgo.globalOptionId || pgo.globalOption?.id,
          maxSelections: pgo.maxSelections,
          minSelections: pgo.minSelections,
          isRequired: pgo.isRequired || false
        }))
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 No global options found, using empty array')
        }
        return []
      }
    })(),
    // Campos adicionales de precios
    pricing: {
      costPrice: initialData?.pricing?.costPrice || 0,
      wholesalePrice: initialData?.pricing?.wholesalePrice || 0,
      bulkDiscount: {
        enabled: initialData?.pricing?.bulkDiscount?.enabled || false,
        minQuantity: initialData?.pricing?.bulkDiscount?.minQuantity || 10,
        discountPercentage: initialData?.pricing?.bulkDiscount?.discountPercentage || 10
      },
      taxRate: initialData?.pricing?.taxRate || 0,
      commission: initialData?.pricing?.commission || 0
    }
  })

  const [categories, setCategories] = useState<any[]>([])
  const [availableGlobalOptions, setAvailableGlobalOptions] = useState<GlobalOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Variable de referencia para las opciones globales asignadas
  const assignedGlobalOptions = React.useMemo(() => {
    // SIEMPRE usar formData.globalOptions si está definido (incluso si está vacío)
    if (formData.globalOptions !== undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Computing assigned global options from formData:', formData.globalOptions)
      }
      return formData.globalOptions.map((fgo: any) => {
        const globalOption = availableGlobalOptions?.find(go => go.id === fgo.globalOptionId)
        return {
          globalOptionId: fgo.globalOptionId,
          maxSelections: fgo.maxSelections,
          minSelections: fgo.minSelections,
          isRequired: fgo.isRequired,
          globalOption: globalOption
        }
      })
    }
    // Solo usar initialData como fallback cuando formData.globalOptions no esté definido
    else if ((initialData as any)?.productGlobalOptions && Array.isArray(data?.productGlobalOptions)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Computing assigned global options from initialData:', data?.productGlobalOptions)
      }
      return data?.productGlobalOptions.map((pgo: any) => ({
        globalOptionId: pgo.globalOptionId || pgo.globalOption?.id,
        maxSelections: pgo.maxSelections,
        minSelections: pgo.minSelections,
        isRequired: pgo.isRequired || false,
        globalOption: pgo.globalOption
      }))
    }
    return []
  }, [formData.globalOptions, (initialData as any)?.productGlobalOptions, availableGlobalOptions])
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false)
  const [globalOptionsExpanded, setGlobalOptionsExpanded] = useState(false)
  const [optionsExpanded, setOptionsExpanded] = useState(false)
  const [variantsExpanded, setVariantsExpanded] = useState(false)

  // Cargar opciones globales disponibles
  useEffect(() => {
    const loadGlobalOptions = async () => {
      try {
        const response = await fetch('/api/dashboard/global-options', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Available Global Options loaded:', data)
          }
          setAvailableGlobalOptions(data)
        } else {
          // Si no está autenticado o hay error, mantener array vacío
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Error loading global options:', response.status)
          }
          setAvailableGlobalOptions([])
        }
      } catch (error) {
        console.error('Error loading global options:', error)
        setAvailableGlobalOptions([])
      }
    }
    loadGlobalOptions()
  }, [])

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/dashboard/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Actualizar formulario cuando cambien los datos iniciales
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: data?.name || '',
        isActive: data?.isActive !== undefined ? data?.isActive : true,
        type: data?.type || 'physical',
        sku: data?.sku || '',
        weight: data?.weight || 0,
        price: data?.price || 0,
        originalPrice: data?.originalPrice || 0,
        description: data?.description || '',
        imageUrl: data?.imageUrl || data?.images?.[0]?.url || '',
        deliveryMethods: {
          pickup: data?.deliveryHome || true,
          shipping: data?.deliveryStore || false
        },
        variants: (data?.variants && Array.isArray(data?.variants)) ? data?.variants.map((v: any) => ({
          id: v?.id,
          name: v?.name || '',
          price: Number(v?.price) || 0,
          originalPrice: Number(v?.originalPrice) || 0,
          sku: v?.value || v?.sku || '',
          weight: Number(v?.weight) || 0,
          imageUrl: v?.imageUrl || ''
        })) : [],
        options: (data?.options && Array.isArray(data?.options)) ? data?.options.map((o: any) => ({
          id: o?.id,
          name: o?.name || '',
          type: o?.type || 'text',
          isRequired: Boolean(o?.isRequired),
          enableQuantity: Boolean(o?.enableQuantity),
          choices: (o?.choices && Array.isArray(o.choices)) ? o.choices.map((c: any) => ({
            id: c?.id,
            name: c?.name || '',
            price: Number(c?.price) || 0
          })) : []
        })) : [],
        inventory: {
          trackQuantity: data?.trackQuantity || false,
          stock: data?.stock || 0,
          dailyCapacity: data?.dailyCapacity || false,
          maxDailySales: data?.maxDailySales || undefined,
          maxOrderQuantity: data?.maxOrderQuantity || false,
          maxQuantity: data?.maxQuantity || undefined,
          minOrderQuantity: data?.minOrderQuantity || false,
          minQuantity: data?.minQuantity || undefined
        },
        tags: data?.tags || [],
        categoryId: data?.categoryProducts?.[0]?.category?.id || (isEditing ? 'no-category' : ''),
        globalOptions: [],
        // Campos adicionales de precios
        pricing: {
          costPrice: data?.pricing?.costPrice || 0,
          wholesalePrice: data?.pricing?.wholesalePrice || 0,
          bulkDiscount: {
            enabled: data?.pricing?.bulkDiscount?.enabled || false,
            minQuantity: data?.pricing?.bulkDiscount?.minQuantity || 10,
            discountPercentage: data?.pricing?.bulkDiscount?.discountPercentage || 10
          },
          taxRate: data?.pricing?.taxRate || 0,
          commission: data?.pricing?.commission || 0
        }
      })
    }
  }, [initialData, isEditing])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof ProductFormData] as any || {}),
        [field]: value
      }
    }))
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      name: '',
      price: formData.price,
      originalPrice: formData.originalPrice,
      sku: '',
      weight: formData.weight,
      isExpanded: true
    }
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const toggleVariantExpanded = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, isExpanded: !variant.isExpanded } : variant
      )
    }))
  }

  const addOption = () => {
    const newOption: ProductOption = {
      name: '',
      type: 'text',
      isRequired: false,
      enableQuantity: false,
      choices: []
    }
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }))
  }

  const updateOption = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }))
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const addOptionChoice = (optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { 
              ...option, 
              choices: [...option.choices, { name: '', price: 0 }]
            }
          : option
      )
    }))
  }

  const updateOptionChoice = (optionIndex: number, choiceIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { 
              ...option, 
              choices: option.choices.map((choice, j) => 
                j === choiceIndex ? { ...choice, [field]: value } : choice
              )
            }
          : option
      )
    }))
  }

  const removeOptionChoice = (optionIndex: number, choiceIndex: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { 
              ...option, 
              choices: option.choices.filter((_, j) => j !== choiceIndex)
            }
          : option
      )
    }))
  }

  // Funciones para opciones globales
  const addGlobalOption = (globalOptionId: string) => {
    const globalOption = availableGlobalOptions?.find(go => go.id === globalOptionId)
    if (globalOption) {
      setFormData(prev => ({
        ...prev,
        globalOptions: [...(prev.globalOptions || []), {
          globalOptionId,
          maxSelections: globalOption.maxSelections,
          minSelections: globalOption.minSelections,
          isRequired: globalOption.isRequired
        }]
      }))
    }
  }

  const removeGlobalOption = (index: number) => {
    // Obtener el globalOptionId del assignedGlobalOptions
    const assignedOption = assignedGlobalOptions[index]
    if (!assignedOption) return
    
    const globalOptionId = assignedOption.globalOptionId
    
    setFormData(prev => ({
      ...prev,
      globalOptions: (prev.globalOptions || []).filter(go => go.globalOptionId !== globalOptionId)
    }))
  }

  const updateGlobalOption = (index: number, field: string, value: any) => {
    // Obtener el globalOptionId del assignedGlobalOptions
    const assignedOption = assignedGlobalOptions[index]
    if (!assignedOption) return
    
    const globalOptionId = assignedOption.globalOptionId
    
    setFormData(prev => ({
      ...prev,
      globalOptions: (prev.globalOptions || []).map(option => 
        option.globalOptionId === globalOptionId ? { ...option, [field]: value } : option
      )
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe exceder 10MB')
      return
    }

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'product') // Tipo para productos

      const response = await fetch('/api/dashboard/upload-product-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await response.json()
      
      // Actualizar la imagen principal del producto
      setFormData(prev => ({
        ...prev,
        imageUrl: data.imageUrl
      }))
      
      toast.success('Imagen subida correctamente')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    }
  }

  const handleVariantImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, variantIndex: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe exceder 10MB')
      return
    }

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/dashboard/upload-product-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await response.json()

      // Actualizar la variante con la nueva imagen
      updateVariant(variantIndex, 'imageUrl', data.imageUrl)
      toast.success('Imagen subida correctamente')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    }
  }

  const handleGenerateImage = () => {
    // TODO: Implementar generación automática de imagen
    toast.info("Funcionalidad de generación de imagen pendiente de implementar")
  }

  const handleReorderVariants = (reorderedVariants: ProductVariant[]) => {
    setFormData(prev => ({
      ...prev,
      variants: reorderedVariants
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre del producto es requerido")
      return
    }

    // Solo validar categoría si se está creando un producto nuevo
    if (!isEditing && (!formData.categoryId || formData.categoryId === 'no-category')) {
      toast.error("La categoría es requerida para productos nuevos")
      return
    }

    setIsLoading(true)
    try {
      // Preparar datos para envío
      const dataToSend = {
        ...formData,
        categoryId: formData.categoryId === 'no-category' ? '' : formData.categoryId
      }

      if (onSave) {
        onSave(dataToSend)
      } else {
        const url = isEditing ? `/api/dashboard/products/${(initialData as any)?.id}` : '/api/dashboard/products'
        const method = isEditing ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        })

        if (response.ok) {
          toast.success(isEditing ? "Producto actualizado" : "Producto creado")
          if (!isEditing) {
            router.push('/dashboard/products')
          }
        } else {
          const error = await response.json()
          toast.error(error.message || "Error al guardar producto")
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error("Error al guardar producto")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return <div>Cargando...</div>
  }

  const formContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? "Editar Producto" : "Nuevo Producto"}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
      <Card>
        <CardHeader>
              <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
            <Input
              id="name"
                    placeholder="Nombre"
              value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
                  <Label htmlFor="visibility">Visibilidad</Label>
                  <Select 
                    value={formData.isActive ? 'visible' : 'hidden'}
                    onValueChange={(value) => handleInputChange('isActive', value === 'visible')}
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
          <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Físico</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Categoría {!isEditing && <span className="text-red-500">*</span>}
                  </Label>
              <Select 
                value={formData.categoryId} 
                    onValueChange={(value) => handleInputChange('categoryId', value)}
              >
                    <SelectTrigger>
                      <SelectValue placeholder={isEditing ? "Sin categoría asignada" : "Buscar o crear categoría"} />
                </SelectTrigger>
                <SelectContent>
                      {isEditing && (
                        <SelectItem value="no-category">
                          Sin categoría
                        </SelectItem>
                      )}
                      {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                          {category.name}
                      </SelectItem>
                      ))}
                </SelectContent>
              </Select>
                  {/* Pista visual para crear categorías */}
                  {!isEditing && categories.length === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">No tienes categorías creadas</span>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Las categorías te ayudan a organizar tus productos. Primero crea una categoría.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/categories')}
                        className="text-blue-700 border-blue-300 hover:bg-blue-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear categoría
                      </Button>
                    </div>
                  )}
                  
                  {/* Pista visual cuando hay categorías disponibles */}
                  {!isEditing && categories.length > 0 && formData.categoryId === '' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Selecciona una categoría</span>
                      </div>
                      <p className="text-sm text-amber-700 mb-3">
                        Elige una categoría para organizar este producto, o crea una nueva.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/dashboard/categories')}
                          className="text-amber-700 border-amber-300 hover:bg-amber-100"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva categoría
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="SKU"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso</Label>
                  <div className="flex">
                    <Input
                      id="weight"
                      type="number"
                      placeholder="0"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                    />
                    <span className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm">
                      g
                    </span>
                  </div>
                </div>
          </div>
        </CardContent>
      </Card>

          {/* Prices */}
      <Card>
        <CardHeader>
              <CardTitle>Precios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <div className="flex">
                    <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm">
                      MXN
                    </span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Precio original</Label>
                  <div className="flex">
                    <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm">
                      MXN
                    </span>
                    <Input
                      id="originalPrice"
                      type="number"
                      placeholder="0"
                      value={formData.originalPrice || ''}
                      onChange={(e) => handleInputChange('originalPrice', Number(e.target.value))}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvancedPricing(!showAdvancedPricing)}
              >
                {showAdvancedPricing ? 'Mostrar menos' : 'Mostrar más'} 
                {showAdvancedPricing ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>

              {/* Campos adicionales de precios */}
              {showAdvancedPricing && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground">Precios avanzados</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Precio de costo</Label>
                      <div className="flex">
                        <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm">
                          MXN
                        </span>
                        <Input
                          id="costPrice"
                          type="number"
                          placeholder="0"
                          value={formData.pricing.costPrice || ''}
                          onChange={(e) => handleNestedChange('pricing', 'costPrice', Number(e.target.value))}
                          className="rounded-l-none"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Costo de adquisición o producción
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wholesalePrice">Precio al mayoreo</Label>
                      <div className="flex">
                        <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm">
                          MXN
                        </span>
                        <Input
                          id="wholesalePrice"
                          type="number"
                          placeholder="0"
                          value={formData.pricing.wholesalePrice || ''}
                          onChange={(e) => handleNestedChange('pricing', 'wholesalePrice', Number(e.target.value))}
                          className="rounded-l-none"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Precio para ventas al mayoreo
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tasa de impuesto (%)</Label>
                      <div className="flex">
                        <Input
                          id="taxRate"
                          type="number"
                          placeholder="0"
                          value={formData.pricing.taxRate || ''}
                          onChange={(e) => handleNestedChange('pricing', 'taxRate', Number(e.target.value))}
                          className="rounded-r-none"
                        />
                        <span className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Impuesto aplicado al producto
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commission">Comisión (%)</Label>
                      <div className="flex">
                        <Input
                          id="commission"
                          type="number"
                          placeholder="0"
                          value={formData.pricing.commission || ''}
                          onChange={(e) => handleNestedChange('pricing', 'commission', Number(e.target.value))}
                          className="rounded-r-none"
                        />
                        <span className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Comisión por venta
                      </p>
                    </div>
                  </div>

                  {/* Descuento por cantidad */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="bulkDiscountEnabled"
                        checked={formData.pricing.bulkDiscount?.enabled || false}
                        onChange={(e) => handleNestedChange('pricing', 'bulkDiscount', {
                          ...formData.pricing.bulkDiscount,
                          enabled: e.target.checked
                        })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="bulkDiscountEnabled" className="text-sm">
                        Habilitar descuento por cantidad
                      </Label>
                    </div>

                    {formData.pricing.bulkDiscount?.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                        <div className="space-y-2">
                          <Label htmlFor="bulkMinQuantity">Cantidad mínima</Label>
                          <Input
                            id="bulkMinQuantity"
                            type="number"
                            placeholder="10"
                            value={formData.pricing.bulkDiscount?.minQuantity || ''}
                            onChange={(e) => handleNestedChange('pricing', 'bulkDiscount', {
                              ...formData.pricing.bulkDiscount,
                              minQuantity: Number(e.target.value)
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bulkDiscountPercentage">Descuento (%)</Label>
                          <div className="flex">
                            <Input
                              id="bulkDiscountPercentage"
                              type="number"
                              placeholder="10"
                              value={formData.pricing.bulkDiscount?.discountPercentage || ''}
                              onChange={(e) => handleNestedChange('pricing', 'bulkDiscount', {
                                ...formData.pricing.bulkDiscount,
                                discountPercentage: Number(e.target.value)
                              })}
                              className="rounded-r-none"
                            />
                            <span className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Decorate with **bold** ~strike~ _italic_"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.imageUrl ? (
                <div className="space-y-4">
                  {/* Vista previa de la imagen principal */}
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt={`${formData.name || 'Producto'} - Imagen principal`}
                      className="w-32 h-32 object-cover rounded-lg border mx-auto"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Botón para cambiar imagen */}
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button asChild variant="outline" size="sm">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar imagen
                      </label>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrastre un archivo aquí o haga clic para seleccionarlo
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    El archivo no debe exceder 10mb. La proporción recomendada es 1:1.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar archivo
                    </label>
                  </Button>
                  <Button variant="outline" onClick={handleGenerateImage} className="ml-2">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Entrega
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  ?
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Métodos disponibles</Label>
                <div className="flex gap-2">
                        <Button
                    variant={formData.deliveryMethods.pickup ? "default" : "outline"}
                          size="sm"
                    onClick={() => handleNestedChange('deliveryMethods', 'pickup', !formData.deliveryMethods.pickup)}
                        >
                    Recoger
                        </Button>
                        <Button
                    variant={formData.deliveryMethods.shipping ? "default" : "outline"}
                          size="sm"
                    onClick={() => handleNestedChange('deliveryMethods', 'shipping', !formData.deliveryMethods.shipping)}
                        >
                    Envío
                        </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setVariantsExpanded(!variantsExpanded)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Variantes
                  {formData.variants && formData.variants.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {formData.variants.length} variante{formData.variants.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${variantsExpanded ? 'rotate-180' : ''}`} 
                />
              </CardTitle>
            </CardHeader>
            {variantsExpanded && (
              <CardContent className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Variante {index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVariantExpanded(index)}
                      >
                        {variant.isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        placeholder="Nombre"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio</Label>
                      <div className="flex">
                        <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm">
                          MXN
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Precio original</Label>
                      <div className="flex">
                        <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm">
                          MXN
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={variant.originalPrice || ''}
                          onChange={(e) => updateVariant(index, 'originalPrice', Number(e.target.value))}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>

                  {variant.isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>SKU</Label>
                          <Input
                            placeholder="SKU"
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Stock de la variante</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={variant.stock || ''}
                            onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                          />
                          <p className="text-xs text-muted-foreground">
                            Dejar vacío para usar el stock del producto principal
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Peso</Label>
                          <div className="flex">
                            <Input
                              type="number"
                              placeholder="Peso"
                              value={variant.weight || ''}
                              onChange={(e) => updateVariant(index, 'weight', Number(e.target.value))}
                            />
                            <span className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm">
                              g
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Imagen de la variante</Label>
                        {variant.imageUrl ? (
                          <div className="relative">
                            <img
                              src={variant.imageUrl}
                              alt={`${variant.name} - Imagen`}
                              className="w-24 h-24 object-cover rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0"
                              onClick={() => updateVariant(index, 'imageUrl', '')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                            <Package className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Arrastre un archivo aquí o haga clic para seleccionarlo
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              El archivo no debe exceder 10mb. La proporción recomendada es 1:1.
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`variant-image-${index}`}
                              onChange={(e) => handleVariantImageUpload(e, index)}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById(`variant-image-${index}`)?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Subir imagen
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                    <Button
                    variant="ghost"
                      size="sm"
                    onClick={() => toggleVariantExpanded(index)}
                    className="w-full"
                  >
                    {variant.isExpanded ? 'Mostrar menos' : 'Mostrar más'}
                    {variant.isExpanded ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Button onClick={addVariant} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir variante
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowReorderModal(true)}
                  disabled={formData.variants.length === 0}
                >
                  Cambiar secuencia de variante
                </Button>
            </div>
              </CardContent>
            )}
          </Card>

          {/* Options */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setOptionsExpanded(!optionsExpanded)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Opciones
              {formData.options && formData.options.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {formData.options.length} opción{formData.options.length !== 1 ? 'es' : ''}
                </Badge>
              )}
            </div>
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${optionsExpanded ? 'rotate-180' : ''}`} 
            />
          </CardTitle>
        </CardHeader>
        {optionsExpanded && (
          <CardContent className="space-y-4">
              {formData.options.map((option, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Opción {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
          </div>

            <div className="space-y-2">
                    <Label>Nombre</Label>
                <Input
                      placeholder="Nombre"
                      value={option.name}
                      onChange={(e) => updateOption(index, 'name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                    <Label>Tipo de opción</Label>
                    <Select
                      value={option.type}
                      onValueChange={(value) => updateOption(index, 'type', value)}
                    >
                  <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                              <Type className="w-3 h-3 text-white" />
                            </div>
                            Texto
                          </div>
                        </SelectItem>
                        <SelectItem value="number">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                              <Hash className="w-3 h-3 text-white" />
                            </div>
                            Número
                          </div>
                        </SelectItem>
                        <SelectItem value="date">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                              <Calendar className="w-3 h-3 text-white" />
                            </div>
                            Fecha
                          </div>
                        </SelectItem>
                        <SelectItem value="checkbox">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                              <CheckSquare className="w-3 h-3 text-white" />
                            </div>
                            Casillas
                          </div>
                        </SelectItem>
                        <SelectItem value="select">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                              <Target className="w-3 h-3 text-white" />
                            </div>
                            Selección
                          </div>
                        </SelectItem>
                        <SelectItem value="media">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                              <Upload className="w-3 h-3 text-white" />
                            </div>
                            Medios
                          </div>
                        </SelectItem>
                  </SelectContent>
                </Select>
              </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={option.isRequired}
                        onChange={(e) => updateOption(index, 'isRequired', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`required-${index}`} className="text-sm">
                        Requerido
                      </Label>
                  </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`quantity-${index}`}
                        checked={option.enableQuantity}
                        onChange={(e) => updateOption(index, 'enableQuantity', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`quantity-${index}`} className="text-sm">
                        Activar cantidad
                      </Label>
                    </div>
                  </div>

                  {/* Mostrar opciones de elección solo para checkbox, select y media */}
                  {(option.type === 'checkbox' || option.type === 'select' || option.type === 'media') && (
                    <div className="space-y-3 pt-4 border-t">
                      <h5 className="font-medium">Elecciones</h5>
                      {option.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="flex items-center gap-2">
                              <Input
                            placeholder="Nombre"
                            value={choice.name}
                            onChange={(e) => updateOptionChoice(index, choiceIndex, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <div className="flex">
                            <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm">
                              MXN
                            </span>
                                <Input
                                  type="number"
                              placeholder="0"
                              value={choice.price || 0}
                              onChange={(e) => updateOptionChoice(index, choiceIndex, 'price', Number(e.target.value) || 0)}
                              className="rounded-l-none w-24"
                                />
                              </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOptionChoice(index, choiceIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                            </div>
                      ))}
                            <Button
                              variant="outline"
                              size="sm"
                        onClick={() => addOptionChoice(index)}
                            >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir elección
                            </Button>
                    </div>
                          )}
                        </div>
              ))}

              <Button onClick={addOption} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Añadir opción
              </Button>
            </CardContent>
          )}
          </Card>

          {/* Opciones Globales */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setGlobalOptionsExpanded(!globalOptionsExpanded)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Opciones Globales
                  {assignedGlobalOptions && assignedGlobalOptions.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {assignedGlobalOptions.length} asignada{assignedGlobalOptions.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${globalOptionsExpanded ? 'rotate-180' : ''}`} 
                />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Usa opciones reutilizables como "Salsas para Alitas" que puedes usar en múltiples productos
              </p>
            </CardHeader>
            {globalOptionsExpanded && (
              <CardContent className="space-y-4">
              {/* Selector de opciones globales disponibles */}
              {availableGlobalOptions && availableGlobalOptions.length > 0 && (
                <div className="space-y-2">
                  <Label>Agregar opción global</Label>
                  <Select onValueChange={addGlobalOption}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una opción global" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGlobalOptions
                        ?.filter(go => !(formData.globalOptions || []).some(fgo => fgo.globalOptionId === go.id))
                        ?.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              <span>{option.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({option.type}) - {option.choices.length} elecciones
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Lista de opciones globales asignadas */}
              {assignedGlobalOptions && assignedGlobalOptions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Opciones Globales Asignadas</h4>
                    <Badge variant="secondary" className="text-xs">
                      {assignedGlobalOptions.length} asignada{assignedGlobalOptions.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {assignedGlobalOptions.map((assignedOption: any, index: any) => {
                      const option = assignedOption.globalOption
                      if (!option) {
                        return (
                          <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-red-500" />
                                <span className="text-red-700 font-medium">Opción global no encontrada</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGlobalOption(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <Card key={index} className="border-l-4 border-l-gray-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <Layers className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900">{option.name}</h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs font-medium px-1 py-0.5">
                                      {option.type}
                                    </Badge>
                                    {assignedOption.isRequired && (
                                      <Badge 
                                        variant="destructive" 
                                        className="text-xs bg-red-600 text-white border-red-600 font-medium px-1 py-0.5"
                                      >
                                        Obligatorio
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGlobalOption(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Mínimo de selecciones</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={assignedOption.minSelections || ''}
                                  onChange={(e) => updateGlobalOption(index, 'minSelections', e.target.value ? parseInt(e.target.value) : null)}
                                  placeholder="0"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Máximo de selecciones</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={assignedOption.maxSelections || ''}
                                  onChange={(e) => updateGlobalOption(index, 'maxSelections', e.target.value ? parseInt(e.target.value) : null)}
                                  placeholder="Sin límite"
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mb-4">
                              <Switch
                                id={`global-required-${index}`}
                                checked={assignedOption.isRequired}
                                onCheckedChange={(checked) => updateGlobalOption(index, 'isRequired', checked)}
                              />
                              <Label htmlFor={`global-required-${index}`} className="text-sm font-medium">
                                Opción obligatoria
                              </Label>
                            </div>

                            {/* Preview de elecciones */}
                            {option.choices && option.choices.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Elecciones disponibles:</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {option.choices.slice(0, 6).map((choice: any, choiceIndex: any) => (
                                    <Badge key={choiceIndex} variant="outline" className="text-xs">
                                      {choice.name} {choice.price > 0 && `(+$${choice.price})`}
                                    </Badge>
                                  ))}
                                  {option.choices.length > 6 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{option.choices.length - 6} más
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay opciones globales asignadas */}
              {(!assignedGlobalOptions || assignedGlobalOptions.length === 0) && availableGlobalOptions && availableGlobalOptions.length > 0 && (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay opciones globales asignadas a este producto</p>
                  <p className="text-xs">Selecciona una opción global del menú de arriba para agregarla</p>
                </div>
              )}

              {(!availableGlobalOptions || availableGlobalOptions.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay opciones globales disponibles</p>
                  <p className="text-sm">Crea opciones globales en la sección "Opciones Globales" del menú</p>
                </div>
              )}
              </CardContent>
            )}
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
                    </div>
                  </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* WhatsApp Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Configurar <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
        </CardContent>
      </Card>

          {/* Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventario
          </CardTitle>
        </CardHeader>
            <CardContent className="space-y-4">
              {/* Rastrear cantidad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Rastrear cantidad</Label>
                  <Switch
                    checked={formData.inventory.trackQuantity}
                    onCheckedChange={(checked) => handleNestedChange('inventory', 'trackQuantity', checked)}
                  />
                </div>
                {formData.inventory.trackQuantity && (
                  <div className="ml-4">
                    <Label htmlFor="stock">Cantidad en stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.inventory.stock}
                      onChange={(e) => handleNestedChange('inventory', 'stock', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              {/* Capacidad diaria */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Capacidad diaria</Label>
                  <Switch
                    checked={formData.inventory.dailyCapacity}
                    onCheckedChange={(checked) => handleNestedChange('inventory', 'dailyCapacity', checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  El número máximo de artículos que puedes vender por día
                </p>
                {formData.inventory.dailyCapacity && (
                  <div className="ml-4">
                    <Label htmlFor="maxDailySales">Máximo de ventas por día</Label>
                    <Input
                      id="maxDailySales"
                      type="number"
                      min="1"
                      value={formData.inventory.maxDailySales || ''}
                      onChange={(e) => handleNestedChange('inventory', 'maxDailySales', Number(e.target.value))}
                      placeholder="Ej: 100"
                    />
                </div>
                )}
              </div>

              {/* Cantidad máxima de pedido */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Cantidad máxima de pedido</Label>
                  <Switch
                    checked={formData.inventory.maxOrderQuantity}
                    onCheckedChange={(checked) => handleNestedChange('inventory', 'maxOrderQuantity', checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  El número máximo de artículos que los clientes pueden comprar por pedido
                </p>
                {formData.inventory.maxOrderQuantity && (
                  <div className="ml-4">
                    <Label htmlFor="maxQuantity">Cantidad máxima</Label>
                    <Input
                      id="maxQuantity"
                      type="number"
                      min="1"
                      value={formData.inventory.maxQuantity || ''}
                      onChange={(e) => handleNestedChange('inventory', 'maxQuantity', Number(e.target.value))}
                      placeholder="Ej: 10"
                    />
                </div>
                )}
          </div>

              {/* Cantidad mínima de pedido */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Cantidad mínima de pedido</Label>
              <Switch
                    checked={formData.inventory.minOrderQuantity}
                    onCheckedChange={(checked) => handleNestedChange('inventory', 'minOrderQuantity', checked)}
              />
            </div>
                <p className="text-xs text-muted-foreground">
                  La cantidad mínima de artículos que los clientes deben comprar por pedido
                </p>
                {formData.inventory.minOrderQuantity && (
                  <div className="ml-4">
                    <Label htmlFor="minQuantity">Cantidad mínima</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      min="1"
                      value={formData.inventory.minQuantity || ''}
                      onChange={(e) => handleNestedChange('inventory', 'minQuantity', Number(e.target.value))}
                      placeholder="Ej: 2"
                    />
            </div>
                )}
          </div>
        </CardContent>
      </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Etiquetas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="Etiquetas" />
            </CardContent>
          </Card>
      </div>
      </div>

      {/* Modal para reordenar variantes */}
      <ReorderVariantsModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        variants={formData.variants}
        onSave={handleReorderVariants}
        productName={formData.name || "Producto"}
      />
    </div>
  )

  // Si standalone es true, incluir DashboardLayout, si no, solo el contenido
  if (standalone) {
    return (
      <DashboardLayout 
        title={isEditing ? "Editar Producto" : "Nuevo Producto"}
        user={{
          name: session.user?.name || "Usuario",
          email: session.user?.email || "",
          avatar: session.user?.avatar || undefined
        }}
      >
        {formContent}
      </DashboardLayout>
    )
  }

  return formContent
}