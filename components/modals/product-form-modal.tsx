"use client"

import { useState } from "react"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal"
import { ProductForm } from "@/components/forms/product-form"
import { toast } from "sonner"

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onProductCreated?: () => void
}

export function ProductFormModal({ isOpen, onClose, onProductCreated }: ProductFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear producto')
      }

      const product = await response.json()
      toast.success(`Producto "${product.name}" creado exitosamente`)
      
      // Cerrar modal y refrescar lista
      onClose()
      if (onProductCreated) {
        onProductCreated()
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear producto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto" fullScreenOnMobile={true}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Crear Nuevo Producto</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Agrega un nuevo producto a tu menú digital. Puedes configurar variantes como tamaños, colores, sabores, etc.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ProductForm />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}


