import CheckoutDemo from '@/components/checkout/checkout-demo'

export default function TestCheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Checkout Inteligente - Demo
          </h1>
          <p className="text-gray-600">
            Prueba el sistema de checkout con captura de ubicación GPS y pago inteligente
          </p>
        </div>
        
        <CheckoutDemo />
      </div>
    </div>
  )
}
