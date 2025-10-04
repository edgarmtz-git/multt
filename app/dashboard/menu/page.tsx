"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { MenuBuilder } from "@/components/menu/menu-builder"
import { ProductFormModal } from "@/components/modals/product-form-modal"
import { useEffect, useState, Suspense } from "react"

function MenuContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | null>(null)

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

  useEffect(() => {
    // Verificar parámetros de URL
    const addProduct = searchParams.get('addProduct')
    const editProduct = searchParams.get('editProduct')
    const category = searchParams.get('category')

    if (addProduct === 'true') {
      setShowProductForm(true)
      setEditingProductId(null)
      setPreselectedCategoryId(category)
    } else if (editProduct) {
      setShowProductForm(true)
      setEditingProductId(editProduct)
      setPreselectedCategoryId(null)
    } else {
      setShowProductForm(false)
      setEditingProductId(null)
      setPreselectedCategoryId(null)
    }
  }, [searchParams])

  const handleCloseForm = () => {
    setShowProductForm(false)
    setEditingProductId(null)
    setPreselectedCategoryId(null)
    // Limpiar parámetros de URL
    router.push('/dashboard/menu')
  }

  const handleProductSaved = () => {
    handleCloseForm()
    // Recargar la página para actualizar la lista
    window.location.reload()
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
      title="Menú" 
      user={{
        name: session.user.name || "Usuario",
        email: session.user.email || "",
        avatar: session.user.avatar || undefined,
        company: user?.company || undefined
      }}
    >
      {showProductForm ? (
        <ProductFormModal
          isOpen={showProductForm}
          onClose={handleCloseForm}
        />
      ) : (
        <MenuBuilder 
          onAddProduct={(categoryId) => {
            // Redirigir al formulario de productos con categoría preseleccionada
            const url = categoryId 
              ? `/dashboard/menu?addProduct=true&category=${categoryId}`
              : `/dashboard/menu?addProduct=true`
            router.push(url)
          }}
          onEditProduct={(product) => {
            // Redirigir al formulario de edición
            router.push(`/dashboard/menu?editProduct=${product.id}`)
          }}
          onDeleteProduct={(productId) => {
            // La función de eliminación se maneja en el MenuBuilder
          }}
        />
      )}
    </DashboardLayout>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  )
}