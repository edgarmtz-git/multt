'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Banknote, Building2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

interface PaymentMethod {
  type: 'cash' | 'bank_transfer'
  enabled: boolean
  instructions: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    accountHolder: string
    clabe: string
  }
}

interface PaymentMethodsProps {
  storeSlug: string
  onPaymentMethodSelect?: (method: string) => void
  selectedMethod?: string
}

export default function PaymentMethods({ 
  storeSlug, 
  onPaymentMethodSelect, 
  selectedMethod 
}: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentMethods()
  }, [storeSlug])

  const loadPaymentMethods = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/store/${storeSlug}/payment-methods`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data.methods || [])
      } else {
        setError('No se pudieron cargar los métodos de pago')
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
      setError('Error al cargar los métodos de pago')
    } finally {
      setLoading(false)
    }
  }

  const handleMethodSelect = (methodType: string) => {
    if (onPaymentMethodSelect) {
      onPaymentMethodSelect(methodType)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentMethods.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay métodos de pago disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Métodos de Pago
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Selecciona tu método de pago preferido
        </p>
      </CardHeader>

      <div className="space-y-3">
        {paymentMethods.map((method, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMethod === method.type 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleMethodSelect(method.type)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {method.type === 'cash' ? (
                    <Banknote className="h-6 w-6 text-green-600" />
                  ) : (
                    <Building2 className="h-6 w-6 text-blue-600" />
                  )}
                  
                  <div>
                    <h3 className="font-medium">
                      {method.type === 'cash' ? 'Pago en Efectivo' : 'Transferencia Bancaria'}
                    </h3>
                    {method.instructions && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {method.enabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Disponible
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      No disponible
                    </Badge>
                  )}
                  
                  {selectedMethod === method.type && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Mostrar detalles bancarios si es transferencia */}
              {method.type === 'bank_transfer' && method.bankDetails && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Datos para transferencia:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Banco:</strong> {method.bankDetails.bankName}</p>
                    <p><strong>Titular:</strong> {method.bankDetails.accountHolder}</p>
                    <p><strong>Cuenta:</strong> {method.bankDetails.accountNumber}</p>
                    {method.bankDetails.clabe && (
                      <p><strong>CLABE:</strong> {method.bankDetails.clabe}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instrucciones adicionales */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Información importante:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Los pagos en efectivo se realizan al momento de la entrega</li>
            <li>• Para transferencias, envía el comprobante por WhatsApp</li>
            <li>• Incluye tu número de pedido en el concepto de la transferencia</li>
            <li>• La entrega se realizará una vez confirmado el pago</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
