'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, CheckCircle, XCircle, Package, User, Eye } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string | null
  status: string
  customerName: string
  total: number
  createdAt: Date
  deliveryMethod: string
  items: any[]
}

interface OrdersListWithFilterProps {
  orders: Order[]
}

export function OrdersListWithFilter({ orders }: OrdersListWithFilterProps) {
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active')

  const getStatusIcon = (status: string) => {
    const statusUpper = status.toUpperCase()
    switch (statusUpper) {
      case 'PENDING':
      case 'CONFIRMED':
        return <Clock className="h-4 w-4" />
      case 'PREPARING':
      case 'READY':
      case 'IN_DELIVERY':
        return <Package className="h-4 w-4" />
      case 'DELIVERED':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase()
    const configs: Record<string, { variant: any; label: string; className: string }> = {
      PENDING: { variant: 'secondary', label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { variant: 'default', label: 'Confirmado', className: 'bg-blue-100 text-blue-800' },
      PREPARING: { variant: 'default', label: 'Preparando', className: 'bg-purple-100 text-purple-800' },
      READY: { variant: 'default', label: 'Listo', className: 'bg-indigo-100 text-indigo-800' },
      IN_DELIVERY: { variant: 'default', label: 'En camino', className: 'bg-orange-100 text-orange-800' },
      DELIVERED: { variant: 'default', label: 'Entregado', className: 'bg-green-100 text-green-800' },
      COMPLETED: { variant: 'default', label: 'Completado', className: 'bg-green-100 text-green-800' },
      CANCELLED: { variant: 'destructive', label: 'Cancelado', className: 'bg-red-100 text-red-800' },
    }

    const config = configs[statusUpper] || { variant: 'outline', label: status, className: '' }
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const filteredOrders = orders.filter(order => {
    const statusUpper = order.status.toUpperCase()
    if (filter === 'active') {
      return !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(statusUpper)
    } else if (filter === 'completed') {
      return ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(statusUpper)
    }
    return true
  })

  const activeCount = orders.filter(o => !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.status.toUpperCase())).length
  const completedCount = orders.filter(o => ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.status.toUpperCase())).length

  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="active">
          Activos ({activeCount})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Historial ({completedCount})
        </TabsTrigger>
        <TabsTrigger value="all">
          Todos ({orders.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={filter} className="mt-6">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No hay pedidos en esta categoría</p>
              <p className="text-sm text-gray-500">Los pedidos aparecerán aquí cuando se creen</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(order.status)}
                          <div>
                            <p className="font-semibold">
                              Pedido #{order.orderNumber || order.id.slice(-8)}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <User className="h-3 w-3" />
                              {order.customerName}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(order.status)}
                          <Badge variant="outline">
                            {order.deliveryMethod === 'delivery' ? 'Entrega' : 'Recoger'}
                          </Badge>
                          <Badge variant="outline">
                            {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex flex-col gap-2">
                        <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-3 w-3" />
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
