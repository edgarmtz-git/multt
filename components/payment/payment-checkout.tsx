'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Banknote, Building2, CreditCard, CheckCircle, AlertCircle, Copy } from 'lucide-react'
import { toast } from 'sonner'
import PaymentMethods from './payment-methods'

interface PaymentCheckoutProps {
  storeSlug: string
  orderTotal: number
  onPaymentComplete?: (paymentData: any) => void
}

export default function PaymentCheckout({ 
  storeSlug, 
  orderTotal, 
  onPaymentComplete 
}: PaymentCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [paymentNote, setPaymentNote] = useState('')
  const [showBankDetails, setShowBankDetails] = useState(false)

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    if (method === 'bank_transfer') {
      setShowBankDetails(true)
    } else {
      setShowBankDetails(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  const handlePaymentSubmit = () => {
    if (!selectedMethod) {
      toast.error('Selecciona un método de pago')
      return
    }

    const paymentData = {
      method: selectedMethod,
      amount: orderTotal,
      note: paymentNote,
      timestamp: new Date().toISOString()
    }

    if (onPaymentComplete) {
      onPaymentComplete(paymentData)
    }

    toast.success('Método de pago seleccionado correctamente')
  }

  return (
    <div className="space-y-6">
      {/* Resumen del pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Resumen del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total a pagar:</span>
            <span className="text-2xl font-bold text-green-600">
              ${orderTotal.toFixed(2)} MXN
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Selección de método de pago */}
      <PaymentMethods 
        storeSlug={storeSlug}
        onPaymentMethodSelect={handleMethodSelect}
        selectedMethod={selectedMethod}
      />

      {/* Detalles bancarios para transferencia */}
      {selectedMethod === 'bank_transfer' && showBankDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Datos para Transferencia
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Realiza la transferencia con los siguientes datos
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banco</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">BBVA Bancomer</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('BBVA Bancomer', 'Nombre del banco')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Titular</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Juan Pérez García</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('Juan Pérez García', 'Titular')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número de cuenta</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-mono">0123456789</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('0123456789', 'Número de cuenta')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>CLABE</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-mono">012345678901234567</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('012345678901234567', 'CLABE')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Instrucciones importantes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Incluye tu número de pedido en el concepto</li>
                <li>• Envía el comprobante por WhatsApp</li>
                <li>• La entrega se realizará una vez confirmado el pago</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nota adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Nota adicional (opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Agrega cualquier instrucción especial para tu pedido..."
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Botón de confirmación */}
      <div className="flex justify-end">
        <Button 
          onClick={handlePaymentSubmit}
          disabled={!selectedMethod}
          className="min-w-[200px]"
        >
          {selectedMethod === 'cash' ? (
            <>
              <Banknote className="h-4 w-4 mr-2" />
              Confirmar Pago en Efectivo
            </>
          ) : selectedMethod === 'bank_transfer' ? (
            <>
              <Building2 className="h-4 w-4 mr-2" />
              Confirmar Transferencia
            </>
          ) : (
            'Selecciona un método de pago'
          )}
        </Button>
      </div>

      {/* Información de contacto */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>
              ¿Necesitas ayuda? Contacta al vendedor por WhatsApp para resolver cualquier duda sobre el pago.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
