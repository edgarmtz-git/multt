'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ProductForm } from '@/components/forms/product-form'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { componentClasses } from '@/lib/design-system'
import { toast } from 'sonner'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [productData, setProductData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProductData(data)
      } else {
        toast.error("Error al cargar el producto")
        router.push("/dashboard/products")
      }
    } catch (error) {
      console.error("Error loading product:", error)
      toast.error("Error al cargar el producto")
      router.push("/dashboard/products")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any) => {
    try {
      const response = await fetch(`/api/dashboard/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success("Producto actualizado")
        // Recargar los datos del producto para mostrar las opciones globales actualizadas
        await loadProduct()
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al actualizar producto")
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error("Error al actualizar producto")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-8 text-muted-foreground">
            Cargando producto...
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!productData) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-8 text-muted-foreground">
            Producto no encontrado
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <ProductForm 
          initialData={productData}
          isEditing={true}
          onSave={handleSave}
          standalone={false}
        />
      </div>
    </DashboardLayout>
  )
}