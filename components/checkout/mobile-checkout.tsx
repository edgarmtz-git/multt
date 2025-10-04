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
  Loader2,
  ArrowLeft,
  ArrowRight,
  Home,
  Store,
  Navigation
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
  street1?: string
  street2?: string
  houseType?: string
}

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
  icon: string
}

interface MobileCheckoutProps {
  storeSlug: string
  cartItems: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  onOrderComplete: (orderData: any) => void
}

type CheckoutStep = 'customer' | 'delivery' | 'address' | 'payment' | 'confirm'

export default function MobileCheckout({
  storeSlug,
  cartItems,
  subtotal,
  deliveryFee,
  total,
  onOrderComplete
}: MobileCheckoutProps) {
  // Estados del flujo
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('customer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados de información del cliente
  const [customerName, setCustomerName] = useState('')
  const [customerWhatsApp, setCustomerWhatsApp] = useState('')
  
  // Estados de método de entrega
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')
  
  // Estados de ubicación
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [addressFields, setAddressFields] = useState<AddressFields>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    reference: '',
    street1: '',
    street2: '',
    houseType: ''
  })
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.4326, -99.1332])
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [showMap, setShowMap] = useState(false)
  
  // Estados de métodos de pago
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [amountPaid, setAmountPaid] = useState('')
  const [cashCalculation, setCashCalculation] = useState<{
    isValid: boolean
    change: number
    message: string
  } | null>(null)
  
  // Estados adicionales
  const [observations, setObservations] = useState('')
  const [vendorWhatsApp, setVendorWhatsApp] = useState('')

  // Cargar métodos de pago de la tienda
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await fetch(`/api/store/${storeSlug}/payment-methods`)
        if (response.ok) {
          const data = await response.json()
          setPaymentMethods(data.methods || [])
        }
      } catch (error) {
        console.error('Error loading payment methods:', error)
      }
    }
    
    loadPaymentMethods()
  }, [storeSlug])

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const response = await fetch(`/api/tienda/${storeSlug}`)
        if (response.ok) {
          const data = await response.json()
          setVendorWhatsApp(data.storeInfo?.whatsappMainNumber || '1234567890')
        }
      } catch (error) {
        console.error('Error loading store data:', error)
      }
    }
    
    loadStoreData()
  }, [storeSlug])

  // Validación de WhatsApp
  const validateWhatsApp = validateWhatsAppNumber

  // Captura de ubicación GPS
  const handleGetLocation = async () => {
    setIsGettingLocation(true)
    
    try {
      const coordinates = await getCurrentLocation()
      const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      const geocodingResult = await reverseGeocode(coordinates, googleMapsApiKey)
      
      setAddressFields({
        ...geocodingResult.address,
        coordinates: geocodingResult.coordinates
      })
      
      setMapCenter([coordinates.lat, coordinates.lng])
      setSelectedLocation([coordinates.lat, coordinates.lng])
      setShowMap(true)
      
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
    if (method === 'pickup') {
      setCurrentStep('payment')
    } else {
      setCurrentStep('address')
    }
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
    if (selectedPaymentMethod === 'cash' && amountPaid) {
      const calculation = calculateCashPayment(amountPaid, total)
      setCashCalculation(calculation)
    } else {
      setCashCalculation(null)
    }
  }, [amountPaid, selectedPaymentMethod, total])

  // Validación del formulario por paso
  const isStepValid = (step: CheckoutStep): boolean => {
    switch (step) {
      case 'customer':
        return customerName.trim() !== '' && validateWhatsApp(customerWhatsApp)
      case 'delivery':
        return deliveryMethod !== ''
      case 'address':
        return deliveryMethod === 'pickup' || (
          addressFields.street !== '' &&
          addressFields.number !== '' &&
          addressFields.neighborhood !== '' &&
          addressFields.city !== '' &&
          addressFields.street1 !== '' &&
          addressFields.street2 !== '' &&
          addressFields.houseType !== ''
        )
      case 'payment':
        if (selectedPaymentMethod === 'cash') {
          return amountPaid !== '' && cashCalculation?.isValid === true
        }
        return selectedPaymentMethod !== ''
      default:
        return false
    }
  }

  // Navegación entre pasos
  const goToNextStep = () => {
    if (!isStepValid(currentStep)) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    switch (currentStep) {
      case 'customer':
        setCurrentStep('delivery')
        break
      case 'delivery':
        if (deliveryMethod === 'pickup') {
          setCurrentStep('payment')
        } else {
          setCurrentStep('address')
        }
        break
      case 'address':
        setCurrentStep('payment')
        break
      case 'payment':
        setCurrentStep('confirm')
        break
    }
  }

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'delivery':
        setCurrentStep('customer')
        break
      case 'address':
        setCurrentStep('delivery')
        break
      case 'payment':
        if (deliveryMethod === 'pickup') {
          setCurrentStep('delivery')
        } else {
          setCurrentStep('address')
        }
        break
      case 'confirm':
        setCurrentStep('payment')
        break
    }
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
      message += `🏠 *Entre calles:* ${addressFields.street1} y ${addressFields.street2}\n`
      message += `🏘️ *Tipo de vivienda:* ${addressFields.houseType}\n`
      if (addressFields.reference) {
        message += `📍 *Referencias:* ${addressFields.reference}\n`
      }
    }
    
    // Método de pago
    const paymentMethod = paymentMethods.find(pm => pm.type === selectedPaymentMethod)
    message += `\n💳 *Pago:* ${paymentMethod?.type === 'cash' ? 'Efectivo' : 'Transferencia'}\n`
    if (selectedPaymentMethod === 'cash' && cashCalculation) {
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

  // Manejo del checkout final
  const handleFinalCheckout = async () => {
    setIsSubmitting(true)
    
    try {
      const { message, orderNumber } = generateWhatsAppMessage()
      
      // Crear datos del pedido
      const orderData = {
        orderNumber,
        customerName,
        customerWhatsApp,
        customerEmail: customerWhatsApp,
        deliveryMethod,
        paymentMethod: selectedPaymentMethod,
        address: deliveryMethod === 'delivery' ? addressFields : null,
        items: cartItems,
        subtotal,
        deliveryFee: deliveryMethod === 'delivery' ? deliveryFee : 0,
        total,
        amountPaid: selectedPaymentMethod === 'cash' ? parseFloat(amountPaid) : null,
        change: selectedPaymentMethod === 'cash' ? cashCalculation?.change : null,
        observations,
        whatsappMessage: message,
        storeSlug,
        createdAt: new Date().toISOString()
      }

      // Guardar pedido en la base de datos
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ Pedido guardado en BD:', result.order.id)
        }
      } catch (dbError) {
        console.error('❌ Error guardando en BD:', dbError)
        toast.warning('Pedido enviado pero no se pudo guardar en el sistema')
      }

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(vendorWhatsApp)}?text=${encodeURIComponent(message)}`
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

  // Copiar al portapapeles
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'customer':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Información del Cliente</h2>
              <p className="text-gray-600">Paso 1 de 4</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre completo *</Label>
                <Input
                  id="customerName"
                  placeholder="Tu nombre completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="text-base"
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
                    className="text-base"
                  />
                </div>
                {customerWhatsApp && !validateWhatsApp(customerWhatsApp) && (
                  <p className="text-sm text-red-500">Formato de WhatsApp inválido</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'delivery':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Método de Entrega</h2>
              <p className="text-gray-600">Paso 2 de 4</p>
            </div>
            
            <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange}>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <Store className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Recoger en local</p>
                      <p className="text-sm text-gray-600">Sin costo de envío</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <Home className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Entrega a domicilio</p>
                      <p className="text-sm text-gray-600">+${deliveryFee.toFixed(2)} de envío</p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        )

      case 'address':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Ubicación de Entrega</h2>
              <p className="text-gray-600">Paso 3 de 4</p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="w-full"
                size="lg"
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
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Calle"
                      value={addressFields.street}
                      onChange={(e) => setAddressFields({...addressFields, street: e.target.value})}
                      className="text-base"
                    />
                    <Input
                      placeholder="Número"
                      value={addressFields.number}
                      onChange={(e) => setAddressFields({...addressFields, number: e.target.value})}
                      className="text-base"
                    />
                  </div>
                  
                  <Input
                    placeholder="Colonia"
                    value={addressFields.neighborhood}
                    onChange={(e) => setAddressFields({...addressFields, neighborhood: e.target.value})}
                    className="text-base"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Ciudad"
                      value={addressFields.city}
                      onChange={(e) => setAddressFields({...addressFields, city: e.target.value})}
                      className="text-base"
                    />
                    <Input
                      placeholder="Estado"
                      value={addressFields.state}
                      onChange={(e) => setAddressFields({...addressFields, state: e.target.value})}
                      className="text-base"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Entre calle 1"
                      value={addressFields.street1}
                      onChange={(e) => setAddressFields({...addressFields, street1: e.target.value})}
                      className="text-base"
                    />
                    <Input
                      placeholder="Entre calle 2"
                      value={addressFields.street2}
                      onChange={(e) => setAddressFields({...addressFields, street2: e.target.value})}
                      className="text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de vivienda *</Label>
                    <RadioGroup 
                      value={addressFields.houseType} 
                      onValueChange={(value) => setAddressFields({...addressFields, houseType: value})}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="casa" id="casa" />
                          <Label htmlFor="casa">Casa</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="departamento" id="departamento" />
                          <Label htmlFor="departamento">Departamento</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="oficina" id="oficina" />
                          <Label htmlFor="oficina">Oficina</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="otro" id="otro" />
                          <Label htmlFor="otro">Otro</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Input
                    placeholder="Referencias (opcional)"
                    value={addressFields.reference || ''}
                    onChange={(e) => setAddressFields({...addressFields, reference: e.target.value})}
                    className="text-base"
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Método de Pago</h2>
              <p className="text-gray-600">Paso 4 de 4</p>
            </div>
            
            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.type} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value={method.type} id={method.type} />
                    <Label htmlFor={method.type} className="flex items-center gap-3 flex-1 cursor-pointer">
                      {method.type === 'cash' ? (
                        <Banknote className="h-5 w-5 text-green-500" />
                      ) : (
                        <Building2 className="h-5 w-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {method.type === 'cash' ? 'Efectivo' : 'Transferencia bancaria'}
                        </p>
                        <p className="text-sm text-gray-600">{method.instructions}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Pago en efectivo */}
            {selectedPaymentMethod === 'cash' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Monto con el que paga *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="text-base"
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
              </div>
            )}

            {/* Transferencia bancaria */}
            {selectedPaymentMethod === 'bank_transfer' && (
              <div className="space-y-4">
                {paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Datos para transferencia
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Banco:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails?.bankName}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails?.bankName || '', 'Banco')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cuenta:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails?.accountNumber}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails?.accountNumber || '', 'Cuenta')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Titular:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails?.accountHolder}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails?.accountHolder || '', 'Titular')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails?.clabe && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">CLABE:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails?.clabe}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(paymentMethods.find(pm => pm.type === 'bank_transfer')?.bankDetails?.clabe || '', 'CLABE')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Observaciones */}
            <div className="space-y-2">
              <Label>Observaciones (opcional)</Label>
              <Textarea
                placeholder="Instrucciones especiales para tu pedido..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                className="text-base"
              />
            </div>
          </div>
        )

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Confirmar Pedido</h2>
              <p className="text-gray-600">Revisa los detalles antes de enviar</p>
            </div>
            
            {/* Resumen del pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Cliente:</h4>
                  <p className="text-sm">{customerName}</p>
                  <p className="text-sm">{customerWhatsApp}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Entrega:</h4>
                  <p className="text-sm">
                    {deliveryMethod === 'pickup' ? 'Recoger en local' : 'Entrega a domicilio'}
                  </p>
                  {deliveryMethod === 'delivery' && addressFields.street && (
                    <p className="text-sm">
                      {addressFields.street} {addressFields.number}, {addressFields.neighborhood}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Pago:</h4>
                  <p className="text-sm">
                    {selectedPaymentMethod === 'cash' ? 'Efectivo' : 'Transferencia bancaria'}
                  </p>
                  {selectedPaymentMethod === 'cash' && cashCalculation && (
                    <p className="text-sm">
                      Monto: ${cashCalculation.amountPaid.toFixed(2)} | Cambio: ${cashCalculation.change.toFixed(2)}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
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
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con progreso */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousStep}
              disabled={currentStep === 'customer'}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Finalizar Pedido</h1>
            <div className="w-8" />
          </div>
          
          {/* Barra de progreso */}
          <div className="flex space-x-2">
            {['customer', 'delivery', 'address', 'payment'].map((step, index) => {
              const stepIndex = ['customer', 'delivery', 'address', 'payment'].indexOf(currentStep)
              const isActive = index <= stepIndex
              const isCurrent = step === currentStep
              
              return (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full ${
                    isActive ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 pb-24">
        <Card>
          <CardContent className="p-6">
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>

      {/* Footer con botones */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2">
        {currentStep === 'confirm' ? (
          <Button 
            onClick={handleFinalCheckout}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Pedido por WhatsApp'
            )}
          </Button>
        ) : (
          <Button 
            onClick={goToNextStep}
            disabled={!isStepValid(currentStep)}
            className="w-full"
            size="lg"
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
