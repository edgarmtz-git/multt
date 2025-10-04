'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Package, MapPin, CreditCard } from 'lucide-react'
import SmartCheckout from './smart-checkout'

// Datos de ejemplo para la demo
const mockCartItems = [
  {
    id: '1',
    name: 'Pizza Margherita',
    quantity: 2,
    price: 15.99,
    variantName: 'Tamaño Grande'
  },
  {
    id: '2',
    name: 'Coca Cola',
    quantity: 1,
    price: 2.50,
    variantName: '600ml'
  }
]

const mockBankDetails = {
  bankName: 'BBVA Bancomer',
  accountNumber: '0123456789',
  accountHolder: 'Juan Pérez García',
  clabe: '012345678901234567',
  instructions: 'Realiza la transferencia y envía el comprobante por WhatsApp'
}

export default function CheckoutDemo() {
  const [showCheckout, setShowCheckout] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<any>(null)

  const subtotal = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = 3.50
  const total = subtotal + deliveryFee

  const handleOrderComplete = (orderData: any) => {
    setCompletedOrder(orderData)
    setShowCheckout(false)
  }

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Package className="h-5 w-5" />
              ¡Pedido Confirmado!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Pedido #{completedOrder.orderNumber}</h3>
              <p className="text-green-700">
                Tu pedido ha sido enviado por WhatsApp al vendedor. 
                Te contactaremos pronto para confirmar los detalles.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Resumen del pedido:</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Cliente:</strong> {completedOrder.customerName}</p>
                <p><strong>WhatsApp:</strong> {completedOrder.customerWhatsApp}</p>
                <p><strong>Método de entrega:</strong> {completedOrder.deliveryMethod === 'pickup' ? 'Recoger en local' : 'Entrega a domicilio'}</p>
                <p><strong>Método de pago:</strong> {completedOrder.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}</p>
                <p><strong>Total:</strong> ${completedOrder.total.toFixed(2)}</p>
              </div>
            </div>

            <Button 
              onClick={() => {
                setCompletedOrder(null)
                setShowCheckout(false)
              }}
              className="w-full"
            >
              Hacer otro pedido
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showCheckout) {
    return (
      <SmartCheckout
        storeSlug="demo-store"
        cartItems={mockCartItems}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
        bankDetails={mockBankDetails}
        onOrderComplete={handleOrderComplete}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Resumen del carrito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Resumen del Carrito
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockCartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.variantName} • Cantidad: {item.quantity}
                </p>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Características del checkout */}
      <Card>
        <CardHeader>
          <CardTitle>Características del Checkout Inteligente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Ubicación GPS</h4>
                <p className="text-sm text-muted-foreground">
                  Captura automática de ubicación y autocompletado de dirección
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Pago Inteligente</h4>
                <p className="text-sm text-muted-foreground">
                  Cálculo automático de cambio y validación de pagos
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ShoppingCart className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Métodos Flexibles</h4>
                <p className="text-sm text-muted-foreground">
                  Pickup en local o entrega a domicilio
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium">WhatsApp Automático</h4>
                <p className="text-sm text-muted-foreground">
                  Notificación automática al vendedor
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón para iniciar checkout */}
      <Button 
        onClick={() => setShowCheckout(true)}
        size="lg"
        className="w-full"
      >
        Proceder al Checkout
      </Button>
    </div>
  )
}
