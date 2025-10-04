"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"
import { toast } from "sonner"

interface CategoryFormData {
  name: string
  isActive: boolean
}

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<CategoryFormData>
}

export function CategoryForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  initialData 
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || "",
    isActive: initialData?.isActive ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre de la categoría es requerido"
    }

    if (formData.name.length > 50) {
      newErrors.name = "El nombre no puede tener más de 50 caracteres"
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
      toast.success("Categoría guardada exitosamente")
    } catch (error) {
      toast.error("Error al guardar la categoría")
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Nueva Categoría
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Categoría *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Pizzas, Bebidas, Postres"
              className={errors.name ? "border-red-500" : ""}
              maxLength={50}
              autoFocus
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/50 caracteres
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isActive">Categoría activa</Label>
          </div>
        </CardContent>
      </Card>

      {/* Vista previa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Vista previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
              📁
            </div>
            <div>
              <h3 className="font-semibold">{formData.name || "Nombre de la categoría"}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={formData.isActive ? "default" : "secondary"}>
                  {formData.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Guardando..." : "Crear Categoría"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}