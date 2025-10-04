"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  Trash2, 
  MoreVertical,
  Package,
  Eye,
  EyeOff
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  isActive: boolean
  _count: {
    products: number
  }
}

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
  onToggleActive: (categoryId: string, isActive: boolean) => void
  onViewProducts: (categoryId: string) => void
}

export function CategoryCard({ 
  category, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onViewProducts 
}: CategoryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = () => {
    onDelete(category.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${
        !category.isActive ? 'opacity-60' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Icono de la categoría */}
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: category.color }}
              >
                {category.icon || "📁"}
              </div>
              
              {/* Información de la categoría */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">{category.name}</h3>
                  {!category.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Inactiva
                    </Badge>
                  )}
                </div>
                
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {category.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{category._count.products} productos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menú de acciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewProducts(category.id)}>
                  <Package className="h-4 w-4 mr-2" />
                  Ver Productos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onToggleActive(category.id, !category.isActive)}
                >
                  {category.isActive ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Activar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la categoría{" "}
              <strong>"{category.name}"</strong>.
              {category._count.products > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  ⚠️ Esta categoría tiene {category._count.products} productos asociados. 
                  No se puede eliminar hasta que muevas o elimines todos los productos.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={category._count.products > 0}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
