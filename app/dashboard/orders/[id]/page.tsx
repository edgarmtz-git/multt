import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Phone
} from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session || !session.user?.id || session.user?.role !== 'CLIENT') {
    redirect('/login')
  }

  // Obtener la orden con todos sus detalles
  const order = await prisma.order.findUnique({
    where: {
      id: id,
      userId: session.user.id // Asegurar que sea del usuario correcto
    },
    include: {
      items: {
        include: {
          product: true,
          options: true
        }
      }
    }
  })

  if (!order) {
    redirect('/dashboard/orders')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'DELIVERED':
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDeliveryMethodText = (method: string) => {
    return method === 'delivery' ? 'Entrega a domicilio' : 'Recoger en tienda'
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo'
      case 'transfer':
        return 'Transferencia bancaria'
      default:
        return method
    }
  }

  const formatAddress = (address: any): string => {
    if (typeof address === 'string') {
      return address
    }

    if (typeof address === 'object' && address !== null) {
      const parts: string[] = []

      if (address.street) parts.push(address.street)
      if (address.colonia || address.neighborhood) parts.push(address.colonia || address.neighborhood)
      if (address.city) parts.push(address.city)
      if (address.postalCode || address.zipCode) parts.push(`CP ${address.postalCode || address.zipCode}`)

      let formatted = parts.join(', ')

      if (address.references || address.reference) {
        formatted += `\n\nReferencias: ${address.references || address.reference}`
      }

      return formatted || JSON.stringify(address)
    }

    return JSON.stringify(address)
  }

  // Obtener usuario para header
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      company: true
    }
  })

  return (
    <DashboardLayout
      user={{
        name: session.user.name || "Usuario",
        email: session.user.email || "",
        avatar: session.user.avatar || undefined,
        company: user?.company || undefined
      }}
    >
      <div className="max-w-5xl mx-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/orders">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Detalle del Pedido</h2>
              <p className="text-muted-foreground">
                #{order.orderNumber || order.id.slice(-8)}
              </p>
            </div>
            <div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                {order.customerWhatsApp && (
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.customerWhatsApp}
                    </p>
                  </div>
                )}
                {order.customerEmail && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{order.customerEmail}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(order.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información de Entrega y Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Entrega y Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Método de entrega</p>
                  <p className="font-medium">{getDeliveryMethodText(order.deliveryMethod)}</p>
                </div>
                {order.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium whitespace-pre-line">{formatAddress(order.address)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Método de pago</p>
                  <p className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {getPaymentMethodText(order.paymentMethod)}
                  </p>
                </div>
                {order.amountPaid && order.paymentMethod === 'cash' && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Paga con</p>
                      <p className="font-medium">${order.amountPaid.toFixed(2)}</p>
                    </div>
                    {order.change !== null && order.change > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Cambio</p>
                        <p className="font-medium">${order.change.toFixed(2)}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      {item.variantName && (
                        <p className="text-sm text-muted-foreground">Variante: {item.variantName}</p>
                      )}
                      {item.options && item.options.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.options.map((option, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground">
                              • {option.optionName}: {option.choiceName}
                              {option.price > 0 && ` (+$${option.price.toFixed(2)})`}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} c/u</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">${(order.subtotal || 0).toFixed(2)}</p>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <p className="text-muted-foreground">Costo de envío</p>
                    <p className="font-medium">${order.deliveryFee.toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <p>Total</p>
                  <p>${order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Observaciones */}
              {order.notes && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Observaciones</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
