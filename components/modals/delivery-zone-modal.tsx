'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  MapPin,
  Save,
  Clock,
  DollarSign
} from 'lucide-react'

interface DeliveryZone {
  id?: string
  name: string
  type: 'FIXED'
  isActive: boolean
  order: number
  
  // Precio fijo
  fixedPrice?: number
  
  // Configuración general
  freeDeliveryThreshold?: number
  estimatedTime?: number
  description?: string
  minOrderValue?: number
}

interface DeliveryZoneModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (zone: DeliveryZone) => void
  initialData?: DeliveryZone
}

export function DeliveryZoneModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData
}: DeliveryZoneModalProps) {
  const [formData, setFormData] = useState<DeliveryZone>({
    name: '',
    type: 'FIXED',
    isActive: true,
    order: 0,
    fixedPrice: 0,
    freeDeliveryThreshold: 0,
    estimatedTime: 30,
    description: '',
    minOrderValue: 0
  })


  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      })
    } else {
      setFormData({
        name: '',
        type: 'FIXED',
        isActive: true,
        order: 0,
        fixedPrice: 0,
        freeDeliveryThreshold: 0,
        estimatedTime: 30,
        description: '',
        minOrderValue: 0
      })
    }
  }, [initialData])

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre de la zona es obligatorio')
      return
    }

    if (formData.type === 'FIXED' && (!formData.fixedPrice || formData.fixedPrice < 0)) {
      toast.error('El precio fijo debe ser mayor o igual a 0')
      return
    }


    onSave(formData)
    onClose()
  }



  const getTypeIcon = (type: string) => {
    return <DollarSign className="h-4 w-4" />
  }

  const getTypeDescription = (type: string) => {
    return 'Precio fijo para toda la zona'
  }

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto" fullScreenOnMobile={true}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {initialData ? 'Editar Zona de Entrega' : 'Crear Zona de Entrega'}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre de la zona *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Zona Centro"
                />
              </div>
              
              <div>
                <Label htmlFor="order">Orden de prioridad</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la zona de entrega..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Zona activa</Label>
                <p className="text-sm text-gray-600">La zona estará disponible para entregas</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <Separator />


          <Separator />

          {/* Configuración de precio fijo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuración de Precio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fixedPrice">Precio fijo ($)</Label>
                <Input
                  id="fixedPrice"
                  type="number"
                  step="0.01"
                  value={formData.fixedPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, fixedPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="freeDeliveryThreshold">Monto mínimo para entrega gratuita ($)</Label>
                <Input
                  id="freeDeliveryThreshold"
                  type="number"
                  step="0.01"
                  value={formData.freeDeliveryThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, freeDeliveryThreshold: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Configuración adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuración Adicional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedTime">Tiempo estimado de entrega (minutos)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {initialData ? 'Actualizar' : 'Crear'} Zona
            </Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
