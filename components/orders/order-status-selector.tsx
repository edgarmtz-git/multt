'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface OrderStatusSelectorProps {
  orderId: string
  currentStatus: string
}

const statusOptions = [
  { value: 'PENDING', label: 'Pendiente', color: 'text-yellow-600' },
  { value: 'CONFIRMED', label: 'Confirmado', color: 'text-blue-600' },
  { value: 'PREPARING', label: 'Preparando', color: 'text-purple-600' },
  { value: 'READY', label: 'Listo', color: 'text-indigo-600' },
  { value: 'IN_DELIVERY', label: 'En camino', color: 'text-orange-600' },
  { value: 'DELIVERED', label: 'Entregado', color: 'text-green-600' },
  { value: 'COMPLETED', label: 'Completado', color: 'text-green-700' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'text-red-600' },
]

export function OrderStatusSelector({ orderId, currentStatus }: OrderStatusSelectorProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el estado')
      }

      setStatus(newStatus)
      toast.success('Estado actualizado correctamente')
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error al actualizar el estado')
      setStatus(currentStatus) // Revertir al estado anterior
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Cambiar estado" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className={option.color}>{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
