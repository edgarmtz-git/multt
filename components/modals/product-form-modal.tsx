"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Producto</DialogTitle>
          <DialogDescription>
            Agrega un nuevo producto a tu menú digital. Puedes configurar variantes como tamaños, colores, sabores, etc.
          </DialogDescription>
        </DialogHeader>
        
        <ProductForm />
      </DialogContent>
    </Dialog>
  )
}


