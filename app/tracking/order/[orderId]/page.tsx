'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  Package,
  Truck,
  Home,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerEmail?: string
  total: number
  notes?: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    productName: string
    quantity: number
    price: number
    variantName?: string
    options?: Array<{
      name: string
      price: number
    }>
  }>
}

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Tu pedido está siendo revisado'
  },
  CONFIRMED: {
    label: 'Confirmado',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800',
    description: 'Tu pedido ha sido confirmado'
  },
  PREPARING: {
    label: 'Preparando',
    icon: Package,
    color: 'bg-orange-100 text-orange-800',
    description: 'Tu pedido está siendo preparado'
  },
  READY: {
    label: 'Listo',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    description: 'Tu pedido está listo para entrega'
  },
  IN_DELIVERY: {
    label: 'En camino',
    icon: Truck,
    color: 'bg-blue-100 text-blue-800',
    description: 'Tu pedido está en camino'
  },
  DELIVERED: {
    label: 'Entregado',
    icon: Home,
    color: 'bg-green-100 text-green-800',
    description: 'Tu pedido ha sido entregado'
  },
  COMPLETED: {
    label: 'Completado',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    description: 'Pedido completado exitosamente'
  },
  CANCELLED: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    description: 'Tu pedido ha sido cancelado'
  }
}

const statusSteps = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'COMPLETED']

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tracking/${orderId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Pedido no encontrado')
        } else {
          setError('Error al cargar el pedido')
        }
        return
      }

      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Error al cargar el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido no encontrado</h1>
          <p className="text-gray-600 mb-4">
            {error || 'No se pudo encontrar el pedido solicitado.'}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
  const currentStepIndex = statusSteps.indexOf(order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguimiento de Pedido</h1>
          <p className="text-gray-600">Pedido #{order.orderNumber}</p>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <currentStatus.icon className="h-6 w-6" />
                <div>
                  <CardTitle className="text-lg">Estado Actual</CardTitle>
                  <p className="text-sm text-gray-600">{currentStatus.description}</p>
                </div>
              </div>
              <Badge className={currentStatus.color}>
                {currentStatus.label}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Steps - Solo mostrar si NO está cancelado */}
        {!isCancelled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Progreso del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const stepConfig = statusConfig[step as keyof typeof statusConfig]
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex

                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <stepConfig.icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {stepConfig.label}
                        </p>
                        <p className="text-sm text-gray-600">{stepConfig.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje especial para cancelado */}
        {isCancelled && (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Pedido Cancelado</h3>
                <p className="text-gray-600">
                  Este pedido ha sido cancelado. Si tienes dudas, contacta con la tienda.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalles del Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Cliente</p>
                  <p className="text-gray-600">{order.customerName}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Fecha</p>
                  <p className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Total</p>
                  <p className="text-gray-600">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Productos</p>
                  <p className="text-gray-600">{order.items.length} items</p>
                </div>
              </div>

              {order.notes && (
                <div>
                  <p className="font-medium text-gray-900">Observaciones</p>
                  <p className="text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    {item.variantName && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {item.variantName}
                      </Badge>
                    )}
                    {item.options && item.options.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Extras:</p>
                        <div className="space-y-1">
                          {item.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">• {option.name}</span>
                              {option.price > 0 && (
                                <span className="text-gray-500 font-medium">+${option.price.toFixed(2)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{item.quantity}x ${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="text-center mt-6">
          <Button 
            onClick={fetchOrder}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Actualizar Estado
          </Button>
        </div>
      </div>
    </div>
  )
}
