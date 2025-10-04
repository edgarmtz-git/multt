'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Smartphone, 
  User, 
  CreditCard, 
  Banknote, 
  Building2,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  getCurrentLocation, 
  reverseGeocode, 
  validateWhatsAppNumber, 
  formatWhatsAppNumber,
  type GeolocationCoordinates,
  type AddressComponents
} from '@/lib/geolocation'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  variantName?: string
  options?: string[]
}

interface AddressFields extends AddressComponents {
  reference?: string
  coordinates?: GeolocationCoordinates
}

interface BankDetails {
  bankName: string
  accountNumber: string
  accountHolder: string
  clabe: string
  instructions: string
}

interface SmartCheckoutProps {
  storeSlug: string
  cartItems: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  bankDetails: BankDetails
  vendorWhatsApp?: string
  onOrderComplete: (orderData: any) => void
}

export default function SmartCheckout({
  storeSlug,
  cartItems,
  subtotal,
  deliveryFee,
  total,
  bankDetails,
  vendorWhatsApp,
  onOrderComplete
}: SmartCheckoutProps) {
  // Estados básicos del cliente
  const [customerName, setCustomerName] = useState('')
  const [customerWhatsApp, setCustomerWhatsApp] = useState('')
  
  // Estados de ubicación
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [addressFields, setAddressFields] = useState<AddressFields>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    reference: ''
  })
  
  // Estados de método de entrega
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')
  const [showAddressFields, setShowAddressFields] = useState(false)
  
  // Estados de método de pago
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [cashCalculation, setCashCalculation] = useState<{
    isValid: boolean
    change: number
    message: string
  } | null>(null)
  
  // Estados adicionales
  const [observations, setObservations] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validación de WhatsApp usando utilidad
  const validateWhatsApp = validateWhatsAppNumber

  // Captura de ubicación GPS
  const handleGetLocation = async () => {
    setIsGettingLocation(true)
    
    try {
      // Obtener coordenadas actuales
      const coordinates = await getCurrentLocation()
      
      // Obtener API key de Google Maps (si está disponible)
      const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      // Geocodificación inversa
      const geocodingResult = await reverseGeocode(coordinates, googleMapsApiKey)
      
      setAddressFields({
        ...geocodingResult.address,
        coordinates: geocodingResult.coordinates
      })
      
      toast.success('Ubicación obtenida correctamente')
    } catch (error) {
      console.error('Error getting location:', error)
      toast.error(error instanceof Error ? error.message : 'No se pudo obtener la ubicación')
    } finally {
      setIsGettingLocation(false)
    }
  }


  // Manejo de método de entrega
  const handleDeliveryMethodChange = (method: 'pickup' | 'delivery') => {
    setDeliveryMethod(method)
    setShowAddressFields(method === 'delivery')
  }

  // Manejo de método de pago
  const handlePaymentMethodChange = (method: 'cash' | 'bank_transfer') => {
    setPaymentMethod(method)
    setAmountPaid('')
    setCashCalculation(null)
  }

  // Cálculo de pago en efectivo
  const calculateCashPayment = (amountPaid: string, orderTotal: number) => {
    const paid = parseFloat(amountPaid)
    const change = paid - orderTotal
    const isValid = paid >= orderTotal

    return {
      amountPaid: paid,
      orderTotal,
      change: Math.max(0, change),
      isValid,
      message: isValid 
        ? `Cambio: $${change.toFixed(2)}` 
        : `Faltan $${(orderTotal - paid).toFixed(2)}`
    }
  }

  // Validación en tiempo real del pago en efectivo
  useEffect(() => {
    if (paymentMethod === 'cash' && amountPaid) {
      const calculation = calculateCashPayment(amountPaid, total)
      setCashCalculation(calculation)
    } else {
      setCashCalculation(null)
    }
  }, [amountPaid, paymentMethod, total])

  // Validación del formulario
  const isFormValid = () => {
    if (!customerName.trim() || !customerWhatsApp.trim()) return false
    if (!validateWhatsApp(customerWhatsApp)) return false
    if (deliveryMethod === 'delivery' && !addressFields.street) return false
    if (paymentMethod === 'cash' && (!amountPaid || !cashCalculation?.isValid)) return false
    return true
  }

  // Copiar al portapapeles
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  // Generar mensaje de WhatsApp
  const generateWhatsAppMessage = () => {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    let message = `🛒 *NUEVO PEDIDO #${orderNumber}*\n\n`
    
    // Información del cliente
    message += `👤 *Cliente:* ${customerName}\n`
    message += `📱 *WhatsApp:* ${customerWhatsApp}\n\n`
    
    // Items del pedido
    message += `📦 *Productos:*\n`
    cartItems.forEach(item => {
      message += `• ${item.name} x${item.quantity} - $${item.price.toFixed(2)}\n`
    })
    
    // Resumen de precios
    message += `\n💰 *Subtotal:* $${subtotal.toFixed(2)}\n`
    if (deliveryMethod === 'delivery') {
      message += `🚚 *Envío:* $${deliveryFee.toFixed(2)}\n`
    }
    message += `💰 *Total:* $${total.toFixed(2)}\n`
    
    // Método de entrega
    message += `\n🚚 *Entrega:* ${deliveryMethod === 'pickup' ? 'Recoger en local' : 'Entrega a domicilio'}\n`
    if (deliveryMethod === 'delivery' && addressFields.street) {
      message += `📍 *Dirección:* ${addressFields.street} ${addressFields.number}, ${addressFields.neighborhood}, ${addressFields.city}\n`
    }
    
    // Método de pago
    message += `\n💳 *Pago:* ${paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}\n`
    if (paymentMethod === 'cash' && cashCalculation) {
      message += `💵 *Monto pagado:* $${cashCalculation.amountPaid.toFixed(2)}\n`
      message += `🔄 *Cambio:* $${cashCalculation.change.toFixed(2)}\n`
    }
    
    // Observaciones
    if (observations) {
      message += `\n📝 *Observaciones:* ${observations}\n`
    }
    
    message += `\n⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}\n`
    message += `\n📞 *Contactar cliente:* https://wa.me/${formatWhatsAppNumber(customerWhatsApp)}`
    
    return { message, orderNumber }
  }

  // Manejo del checkout
  const handleCheckout = async () => {
    if (!isFormValid()) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setIsSubmitting(true)
    
    try {
      const { message, orderNumber } = generateWhatsAppMessage()
      
      // Crear datos del pedido
      const orderData = {
        orderNumber,
        customerName,
        customerWhatsApp,
        customerEmail: customerWhatsApp, // Usar WhatsApp como email temporal
        deliveryMethod,
        paymentMethod,
        address: deliveryMethod === 'delivery' ? addressFields : null,
        items: cartItems,
        subtotal,
        deliveryFee: deliveryMethod === 'delivery' ? deliveryFee : 0,
        total,
        amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : null,
        change: paymentMethod === 'cash' ? cashCalculation?.change : null,
        observations,
        whatsappMessage: message,
        storeSlug,
        createdAt: new Date().toISOString()
      }

      // Guardar pedido en la base de datos
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        })

        if (!response.ok) {
          throw new Error('Error al guardar el pedido')
        }

        const result = await response.json()
        console.log('✅ Pedido guardado en BD:', result.order.id)
      } catch (dbError) {
        console.error('❌ Error guardando en BD:', dbError)
        // Continuar con el proceso aunque falle la BD
        toast.warning('Pedido enviado pero no se pudo guardar en el sistema')
      }

      // Abrir WhatsApp con el mensaje (usar número del vendedor desde configuración)
      const whatsappNumber = vendorWhatsApp || '1234567890'
      const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
      
      // Llamar callback
      onOrderComplete(orderData)
      
      toast.success('Pedido enviado por WhatsApp')
    } catch (error) {
      console.error('Error processing checkout:', error)
      toast.error('Error al procesar el pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Paso 1: Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nombre completo *</Label>
            <Input
              id="customerName"
              placeholder="Tu nombre completo"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerWhatsApp">WhatsApp *</Label>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <Input
                id="customerWhatsApp"
                placeholder="5551234567"
                value={customerWhatsApp}
                onChange={(e) => setCustomerWhatsApp(e.target.value)}
              />
            </div>
            {customerWhatsApp && !validateWhatsApp(customerWhatsApp) && (
              <p className="text-sm text-red-500">Formato de WhatsApp inválido</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paso 2: Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="w-full"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Obtener mi ubicación
              </>
            )}
          </Button>
          
          {addressFields.street && (
            <div className="space-y-2">
              <Label>Dirección (puedes editar los campos)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Calle"
                  value={addressFields.street}
                  onChange={(e) => setAddressFields({...addressFields, street: e.target.value})}
                />
                <Input
                  placeholder="Número"
                  value={addressFields.number}
                  onChange={(e) => setAddressFields({...addressFields, number: e.target.value})}
                />
                <Input
                  placeholder="Colonia"
                  value={addressFields.neighborhood}
                  onChange={(e) => setAddressFields({...addressFields, neighborhood: e.target.value})}
                />
                <Input
                  placeholder="Ciudad"
                  value={addressFields.city}
                  onChange={(e) => setAddressFields({...addressFields, city: e.target.value})}
                />
                <Input
                  placeholder="Estado"
                  value={addressFields.state}
                  onChange={(e) => setAddressFields({...addressFields, state: e.target.value})}
                />
                <Input
                  placeholder="Código Postal"
                  value={addressFields.zipCode}
                  onChange={(e) => setAddressFields({...addressFields, zipCode: e.target.value})}
                />
              </div>
              <Input
                placeholder="Referencias (opcional)"
                value={addressFields.reference || ''}
                onChange={(e) => setAddressFields({...addressFields, reference: e.target.value})}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paso 3: Método de Entrega */}
      <Card>
        <CardHeader>
          <CardTitle>Método de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup">Recoger en local</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery">Entrega a domicilio (+${deliveryFee.toFixed(2)})</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Paso 4: Método de Pago */}
      <Card>
        <CardHeader>
          <CardTitle>Método de Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Efectivo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <Label htmlFor="bank_transfer" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Transferencia bancaria
              </Label>
            </div>
          </RadioGroup>

          {/* Pago en efectivo */}
          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <Label>Monto con el que paga *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
              {cashCalculation && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  cashCalculation.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {cashCalculation.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">{cashCalculation.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Transferencia bancaria */}
          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Datos para transferencia
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Banco:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{bankDetails.bankName}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(bankDetails.bankName, 'Banco')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cuenta:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{bankDetails.accountNumber}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(bankDetails.accountNumber, 'Cuenta')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Titular:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{bankDetails.accountHolder}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(bankDetails.accountHolder, 'Titular')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CLABE:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{bankDetails.clabe}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(bankDetails.clabe, 'CLABE')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                {bankDetails.instructions && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    {bankDetails.instructions}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paso 5: Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Observaciones (Opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Instrucciones especiales para tu pedido..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Resumen del pedido */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {deliveryMethod === 'delivery' && (
            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Botón de confirmar */}
      <Button 
        onClick={handleCheckout}
        disabled={!isFormValid() || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          'Confirmar Pedido'
        )}
      </Button>
    </div>
  )
}
