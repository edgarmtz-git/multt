'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable'
import { 
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface ProductVariant {
  id?: string
  name: string
  price: number
  originalPrice?: number
  sku?: string
  weight?: number
  imageUrl?: string
}

interface ReorderVariantsModalProps {
  isOpen: boolean
  onClose: () => void
  variants: ProductVariant[]
  onSave: (reorderedVariants: ProductVariant[]) => void
  productName?: string
}

function SortableVariantItem({ 
  variant, 
  index 
}: { 
  variant: ProductVariant
  index: number 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: variant.id || `variant-${index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 border rounded-lg bg-white hover:bg-muted/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{variant.name}</h4>
          <Badge variant="outline" className="text-xs">
            #{index + 1}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Precio: ${variant.price}</span>
          {variant.originalPrice && variant.originalPrice > 0 && (
            <span>Original: ${variant.originalPrice}</span>
          )}
          {variant.sku && (
            <span>SKU: {variant.sku}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ReorderVariantsModal({
  isOpen,
  onClose,
  variants,
  onSave,
  productName = "Producto"
}: ReorderVariantsModalProps) {
  const [reorderedVariants, setReorderedVariants] = useState<ProductVariant[]>(variants)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setReorderedVariants((items) => {
        const oldIndex = items.findIndex(item => (item.id || `variant-${items.indexOf(item)}`) === active.id)
        const newIndex = items.findIndex(item => (item.id || `variant-${items.indexOf(item)}`) === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(reorderedVariants)
      toast.success("Secuencia de variantes actualizada")
      onClose()
    } catch (error) {
      console.error('Error saving variant order:', error)
      toast.error("Error al actualizar la secuencia")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setReorderedVariants(variants) // Reset to original order
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Cambiar secuencia de variantes
            <Badge variant="outline" className="text-xs">
              {productName}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {reorderedVariants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay variantes para reordenar</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Arrastra y suelta las variantes para cambiar su orden de visualización
              </p>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={reorderedVariants.map((variant, index) => variant.id || `variant-${index}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {reorderedVariants.map((variant, index) => (
                      <SortableVariantItem
                        key={variant.id || `variant-${index}`}
                        variant={variant}
                        index={index}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || reorderedVariants.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar secuencia'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
