'use client'

import { useState, useEffect } from 'react'
import MobileOptimizedCheckout from './mobile-optimized-checkout'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  variantName?: string
  options?: any[]
}

interface CheckoutWrapperProps {
  storeSlug: string
  cartItems: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  onOrderComplete: (orderData: any) => void
  onClose?: () => void
}

export default function CheckoutWrapper({
  storeSlug,
  cartItems,
  subtotal,
  deliveryFee,
  total,
  onOrderComplete,
  onClose
}: CheckoutWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evitar hidratación hasta que el componente esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <MobileOptimizedCheckout
      storeSlug={storeSlug}
      cartItems={cartItems}
      subtotal={subtotal}
      deliveryFee={deliveryFee}
      total={total}
      onOrderComplete={onOrderComplete}
      onClose={onClose}
    />
  )
}
