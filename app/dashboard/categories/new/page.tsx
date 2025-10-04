"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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

export default function NewCategoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

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

  // Crear nueva categoría
  const handleCreateCategory = async (formData: CategoryFormData) => {
    try {
      const response = await fetch("/api/dashboard/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear categoría")
      }

      toast.success("Categoría creada exitosamente")
      router.push("/dashboard/categories")
    } catch (error: any) {
      toast.error(error.message || "Error al crear la categoría")
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/categories")
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

  return (
    <DashboardLayout 
      title="Nueva Categoría" 
      user={{
        name: session.user.name || "Usuario",
        email: session.user.email || "",
        avatar: session.user.avatar || undefined,
        company: user?.company || undefined
      }}
    >
      <div className="max-w-4xl mx-auto p-6">
        <AdvancedCategoryForm
          onSubmit={handleCreateCategory}
          onCancel={handleCancel}
          isLoading={false}
          isEditing={false}
        />
      </div>
    </DashboardLayout>
  )
}
