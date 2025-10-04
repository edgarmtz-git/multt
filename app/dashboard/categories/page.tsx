"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Tag,
  Package,
  Filter,
  Grid3X3,
  List,
  X,
  GripVertical,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react"
import { CategoryCard } from "@/components/categories/category-card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { componentClasses } from "@/lib/design-system"
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

interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  isActive: boolean
  order: number
  imageUrl?: string
  isVisibleInStore?: boolean
  _count: {
    categoryProducts: number
  }
}

// Componente para elementos arrastrables
function SortableItem({ category, router }: { category: Category; router: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

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
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="ml-3 flex-1">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
          onClick={() => router.push(`/dashboard/categories/${category.id}`)}
        >
          <span className="text-sm font-medium">{category.name}</span>
          {category._count.categoryProducts > 0 && (
            <span className="text-xs text-muted-foreground">
              ({category._count.categoryProducts})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"visible" | "hidden">("visible")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isReordering, setIsReordering] = useState(false)
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [reorderCategories, setReorderCategories] = useState<Category[]>([])

  // Configurar sensores para drag & drop
  const sensors = [
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  ]

  // Verificar autenticación
  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user?.role !== 'CLIENT') {
      router.push('/login')
      return
    }

    // Obtener información del usuario
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(console.error)
  }, [session, status, router])

  // Cargar categorías
  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/categories")
      
      if (!response.ok) {
        throw new Error("Error al cargar categorías")
      }
      
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar las categorías")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])


  // Eliminar categoría
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/dashboard/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar categoría")
      }

      await loadCategories()
      toast.success("Categoría eliminada exitosamente")
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la categoría")
    }
  }

  // Toggle activar/desactivar categoría
  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/dashboard/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar categoría")
      }

      await loadCategories()
      toast.success(`Categoría ${isActive ? "activada" : "desactivada"} exitosamente`)
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la categoría")
    }
  }

  // Ver productos de la categoría
  const handleViewProducts = (categoryId: string) => {
    // Redirigir a la página de menú con filtro por categoría
    window.location.href = `/dashboard/menu?category=${categoryId}`
  }

  // Filtrar categorías
  // Filtrar categorías por búsqueda y pestaña activa
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTab = activeTab === "visible" ? category.isActive : !category.isActive
    return matchesSearch && matchesTab
  })

  // Estadísticas
  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive).length
  const totalProducts = categories.reduce((sum, c) => sum + c._count.categoryProducts, 0)

  // Manejar selección de categorías
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Manejar selección de todas las categorías
  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(filteredCategories.map(c => c.id))
    }
  }

  // Manejar acciones masivas
  const handleBulkAction = async (action: string) => {
    if (selectedCategories.length === 0) {
      toast.error("Selecciona al menos una categoría")
      return
    }

    try {
      switch (action) {
        case 'show':
          await handleBulkToggleVisibility(true)
          break
        case 'hide':
          await handleBulkToggleVisibility(false)
          break
        case 'delete':
          if (confirm(`¿Estás seguro de que quieres eliminar ${selectedCategories.length} categoría(s)? Esta acción no se puede deshacer.`)) {
            await handleBulkDelete()
          }
          break
        default:
          toast.error("Acción no reconocida")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al procesar la acción")
    }
  }

  // Manejar cambio de visibilidad masivo
  const handleBulkToggleVisibility = async (isActive: boolean) => {
    try {
      const promises = selectedCategories.map(categoryId =>
        fetch(`/api/dashboard/categories/${categoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive }),
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedCategories.length} categoría(s) ${isActive ? 'activada(s)' : 'desactivada(s)'} exitosamente`)
      setSelectedCategories([])
      loadCategories()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar las categorías")
    }
  }

  // Manejar eliminación masiva
  const handleBulkDelete = async () => {
    try {
      const promises = selectedCategories.map(categoryId =>
        fetch(`/api/dashboard/categories/${categoryId}`, {
          method: "DELETE",
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedCategories.length} categoría(s) eliminada(s) exitosamente`)
      setSelectedCategories([])
      loadCategories()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar las categorías")
    }
  }

  // Cambiar secuencia
  const handleReorder = () => {
    setShowReorderModal(true)
    setReorderCategories(filteredCategories)
  }

  // Guardar nueva secuencia
  const handleSaveSequence = async () => {
    try {
      const response = await fetch('/api/dashboard/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: reorderCategories.map((cat, index) => ({
            id: cat.id,
            order: index + 1
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar la secuencia')
      }

      toast.success('Secuencia guardada exitosamente')
      setShowReorderModal(false)
      loadCategories() // Recargar categorías
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar la secuencia')
    }
  }

  // Manejar drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setReorderCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'CLIENT') {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout 
        title="Categorías" 
        user={{
          name: session.user.name || "Usuario",
          email: session.user.email || "",
          avatar: session.user.avatar || undefined,
          company: user?.company || undefined
        }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Categorías</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      user={{
        name: session.user.name || "Usuario",
        email: session.user.email || "",
        avatar: session.user.avatar || undefined,
        company: user?.company || undefined
      }}
    >
      <div className="max-w-7xl mx-auto p-6">
        <div className={componentClasses.formContainer}>
      {/* Header */}
      <div className={componentClasses.pageHeader}>
        <h1 className={componentClasses.pageTitle}>Categorías</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleReorder}
            className={`${componentClasses.actionButton} ${isReordering ? "bg-primary text-primary-foreground" : ""}`}
          >
            <span className="text-sm">Cambiar secuencia</span>
            <span className="ml-1 text-xs">?</span>
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/categories/new')}
            className={componentClasses.actionButton}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm">Crear categoría</span>
          </Button>
        </div>
      </div>

      {/* Pestañas */}
      <div className={componentClasses.tabNav}>
        <button
          onClick={() => setActiveTab("visible")}
          className={`${componentClasses.tabButton} ${
            activeTab === "visible"
              ? componentClasses.tabButtonActive
              : componentClasses.tabButtonInactive
          }`}
        >
          Visible
        </button>
        <button
          onClick={() => setActiveTab("hidden")}
          className={`${componentClasses.tabButton} ${
            activeTab === "hidden"
              ? componentClasses.tabButtonActive
              : componentClasses.tabButtonInactive
          }`}
        >
          Oculto
        </button>
      </div>


      {/* Lista de categorías */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No se encontraron categorías" : "No hay categorías"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda"
                : "Crea tu primera categoría para organizar tus productos"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push('/dashboard/categories/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Categoría
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className={componentClasses.listContainer}>
          <CardContent className="p-0">
            <div className="space-y-0">
              {/* Header de la lista con checkbox para seleccionar todo */}
              <div className={componentClasses.listHeader}>
                <input
                  type="checkbox"
                  checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div className="ml-3 flex items-center gap-3">
                  {selectedCategories.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-auto p-1 text-sm font-medium text-foreground hover:text-primary transition-all duration-300 ease-in-out"
                        >
                          <span>Acciones ({selectedCategories.length})</span>
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={() => handleBulkAction('show')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Mostrar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('hide')}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Ocultar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleBulkAction('delete')}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      Seleccionar todas
                    </span>
                  )}
                </div>
              </div>
              
              {/* Lista de categorías */}
              <div className="divide-y">
                {filteredCategories.map((category) => (
                  <div key={category.id} className={componentClasses.listItem}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategorySelect(category.id)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => router.push(`/dashboard/categories/${category.id}`)}
                        >
                          <span className="text-sm font-medium">{category.name}</span>
                          {category._count.categoryProducts > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({category._count.categoryProducts})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {category.isActive && (
                          <Badge 
                            variant="default"
                            className={`${componentClasses.statusBadge} ${componentClasses.statusBadgeVisible}`}
                          >
                            VISIBLE
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Modal de reordenamiento */}
      {showReorderModal && (
        <div className={componentClasses.modalContainer}>
          <div className={componentClasses.modalContent}>
            {/* Header del modal */}
            <div className={componentClasses.modalHeader}>
              <h2 className={componentClasses.modalTitle}>Cambiar secuencia</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReorderModal(false)}
                className={componentClasses.actionButtonSmall}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Contenido del modal */}
            <div className={componentClasses.modalBody}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={reorderCategories.map(cat => cat.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {reorderCategories.map((category) => (
                      <SortableItem key={category.id} category={category} router={router} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Footer del modal */}
            <div className={componentClasses.modalFooter}>
              <Button
                onClick={handleSaveSequence}
                className={componentClasses.actionButton}
              >
                <span className="text-sm">Guardar</span>
              </Button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </DashboardLayout>
  )
}
