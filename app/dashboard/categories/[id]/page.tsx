"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { AdvancedCategoryForm } from "@/components/forms/advanced-category-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { toast } from "sonner"

interface CategoryFormData {
  name: string
  description: string
  isActive: boolean
  imageUrl?: string
  isVisibleInStore: boolean
  products: any[]
}

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
    products: number
  }
}

export default function EditCategoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

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

  // Cargar categoría
  useEffect(() => {
    if (categoryId) {
      loadCategory()
    }
  }, [categoryId])

  const loadCategory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/categories/${categoryId}`)
      
      if (!response.ok) {
        throw new Error("Error al cargar categoría")
      }
      
      const data = await response.json()
      setCategory(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar la categoría")
      router.push("/dashboard/categories")
    } finally {
      setLoading(false)
    }
  }

  // Actualizar categoría
  const handleUpdateCategory = async (formData: CategoryFormData) => {
    try {
      const response = await fetch(`/api/dashboard/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar categoría")
      }

      toast.success("Categoría actualizada exitosamente")
      router.push("/dashboard/categories")
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la categoría")
      throw error
    }
  }

  // Eliminar categoría
  const handleDeleteCategory = async () => {
    try {
      const response = await fetch(`/api/dashboard/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar categoría")
      }

      toast.success("Categoría eliminada exitosamente")
      router.push("/dashboard/categories")
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la categoría")
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/categories")
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'CLIENT') {
    return null
  }

  if (!category) {
    return (
      <DashboardLayout 
        title="Categoría no encontrada" 
        user={{
          name: session.user.name || "Usuario",
          email: session.user.email || "",
          avatar: session.user.avatar || undefined,
          company: user?.company || undefined
        }}
      >
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Categoría no encontrada</h1>
            <p className="text-muted-foreground mb-4">
              La categoría que buscas no existe o no tienes permisos para verla.
            </p>
            <button
              onClick={() => router.push("/dashboard/categories")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Volver a categorías
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title={`Editar: ${category.name}`} 
      user={{
        name: session.user.name || "Usuario",
        email: session.user.email || "",
        avatar: session.user.avatar || undefined,
        company: user?.company || undefined
      }}
    >
      <div className="max-w-4xl mx-auto p-6">
        <AdvancedCategoryForm
          onSubmit={handleUpdateCategory}
          onCancel={handleCancel}
          onDelete={handleDeleteCategory}
          isLoading={false}
          initialData={category}
          isEditing={true}
        />
      </div>
    </DashboardLayout>
  )
}
