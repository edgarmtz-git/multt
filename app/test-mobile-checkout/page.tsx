'use client'

import { useState } from 'react'
import MobileCheckout from '@/components/checkout/mobile-checkout'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  variantName?: string
  options?: string[]
}

export default function TestMobileCheckoutPage() {
  const [completedOrder, setCompletedOrder] = useState<any>(null)

  // Datos de prueba
  const cartItems: CartItem[] = [
    {
      id: '1',
      name: 'Hamburguesa Clásica',
      quantity: 2,
      price: 120.00,
      variantName: 'Mediana',
      options: ['Sin cebolla', 'Extra queso']
    },
    {
      id: '2',
      name: 'Papas Fritas',
      quantity: 1,
      price: 45.00,
      variantName: 'Grande'
    },
    {
      id: '3',
      name: 'Refresco',
      quantity: 2,
      price: 25.00,
      variantName: 'Coca Cola 500ml'
    }
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = 30.00
  const total = subtotal + deliveryFee

  const handleOrderComplete = (orderData: any) => {
    setCompletedOrder(orderData)
    console.log('Pedido completado:', orderData)
  }

  if (completedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            ¡Pedido Confirmado!
          </h2>
          
          <p className="text-gray-600 mb-4">
            Tu pedido #{completedOrder.orderNumber} ha sido enviado por WhatsApp al vendedor.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium mb-2">Resumen del pedido:</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Cliente:</strong> {completedOrder.customerName}</p>
              <p><strong>WhatsApp:</strong> {completedOrder.customerWhatsApp}</p>
              <p><strong>Método de entrega:</strong> {completedOrder.deliveryMethod === 'pickup' ? 'Recoger en local' : 'Entrega a domicilio'}</p>
              <p><strong>Método de pago:</strong> {completedOrder.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}</p>
              <p><strong>Total:</strong> ${completedOrder.total.toFixed(2)}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setCompletedOrder(null)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Probar de Nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <MobileCheckout
      storeSlug="mi-tienda-digital"
      cartItems={cartItems}
      subtotal={subtotal}
      deliveryFee={deliveryFee}
      total={total}
      onOrderComplete={handleOrderComplete}
    />
  )
}
