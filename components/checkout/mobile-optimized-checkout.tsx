'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Home, 
  Store, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  User, 
  Phone, 
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import LeafletInteractiveMap from '@/components/map/leaflet-interactive-map'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  variantName?: string
  options?: any[]
}

interface StoreInfo {
  storeSlug: string
  whatsappMainNumber: string
  phoneNumber: string
  deliveryEnabled: boolean
  cashPaymentEnabled: boolean
  bankTransferEnabled: boolean
  bankName: string
  accountNumber: string
  accountHolder: string
  clabe: string
  transferInstructions: string
  paymentInstructions: string
  deliveryFee: number
  freeDeliveryMinAmount?: number
  freeDeliveryMinItems?: number
}

interface MobileOptimizedCheckoutProps {
  storeSlug: string
  cartItems: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  onOrderComplete: (orderData: any) => void
  onClose?: () => void
}

export default function MobileOptimizedCheckout({
  storeSlug,
  cartItems,
  subtotal,
  deliveryFee,
  total,
  onOrderComplete,
  onClose
}: MobileOptimizedCheckoutProps) {
  // Estados principales
  const [currentStep, setCurrentStep] = useState<'info' | 'delivery' | 'location' | 'payment' | 'summary'>('info')
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Información del cliente
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  // Método de entrega
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')

  // Ubicación
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [addressFields, setAddressFields] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    reference: '',
    street1: '',
    street2: '',
    houseType: '',
    coordinates: null as { lat: number; lng: number } | null
  })

  // Método de pago
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')
  const [cashAmount, setCashAmount] = useState('')
  const [change, setChange] = useState(0)

  // Observaciones
  const [observations, setObservations] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Estados de UI
  const [showMap, setShowMap] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Cargar información de la tienda
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await fetch(`/api/store/${storeSlug}`)
        if (response.ok) {
          const data = await response.json()
          setStoreInfo(data)
        }
      } catch (error) {
        console.error('Error fetching store info:', error)
      }
    }

    fetchStoreInfo()
  }, [storeSlug])

  // Validar WhatsApp
  const validateWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 10
  }

  // Obtener ubicación GPS
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalización no soportada por este navegador')
      return
    }

    setIsGettingLocation(true)
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords
      const coords = { lat: latitude, lng: longitude }
      
      setAddressFields(prev => ({
        ...prev,
        coordinates: coords
      }))
      
      setSelectedLocation([latitude, longitude])
      setSelectedAddress(`Ubicación GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      setShowMap(true)
      
      toast.success('Ubicación obtenida correctamente')
    } catch (error) {
      console.error('Error getting location:', error)
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Permisos de ubicación denegados. Por favor permite el acceso a la ubicación.')
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('Ubicación no disponible. Verifica tu conexión GPS.')
            break
          case error.TIMEOUT:
            toast.error('Tiempo de espera agotado. Intenta de nuevo.')
            break
          default:
            toast.error('Error al obtener la ubicación. Intenta de nuevo.')
        }
      } else {
        toast.error('Error inesperado al obtener la ubicación.')
      }
    } finally {
      setIsGettingLocation(false)
    }
  }

  // Manejar selección de ubicación desde el mapa
  const handleLocationSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    setSelectedAddress(address)
    setSelectedLocation([coordinates.lat, coordinates.lng])
    setAddressFields(prev => ({
      ...prev,
      coordinates,
      street: address.split(',')[0] || '',
      city: address.split(',')[1]?.trim() || '',
      state: address.split(',')[2]?.trim() || ''
    }))
  }

  // Calcular cambio
  useEffect(() => {
    if (paymentMethod === 'cash' && cashAmount) {
      const amount = parseFloat(cashAmount)
      const calculatedChange = amount - total
      setChange(calculatedChange > 0 ? calculatedChange : 0)
    } else {
      setChange(0)
    }
  }, [cashAmount, total, paymentMethod])

  // Copiar al portapapeles
  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copiado al portapapeles')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('Error al copiar')
    }
  }

  // Validar formulario
  const validateForm = () => {
    if (!customerName.trim()) {
      toast.error('El nombre es obligatorio')
      return false
    }
    if (!customerPhone.trim() || !validateWhatsApp(customerPhone)) {
      toast.error('El teléfono debe tener 10 dígitos')
      return false
    }
    if (deliveryMethod === 'delivery') {
      if (!addressFields.street || !addressFields.neighborhood || !addressFields.number || !addressFields.houseType) {
        toast.error('Completa todos los campos de dirección obligatorios')
        return false
      }
    }
    if (paymentMethod === 'cash' && cashAmount && parseFloat(cashAmount) < total) {
      toast.error('El monto en efectivo debe ser mayor o igual al total')
      return false
    }
    if (!termsAccepted) {
      toast.error('Debes aceptar los términos y condiciones')
      return false
    }
    return true
  }

  // Enviar pedido
  const handleSubmitOrder = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const orderData = {
        orderNumber: `PED${Date.now()}`,
        customerName,
        customerWhatsApp: customerPhone,
        customerEmail: customerEmail || `${customerPhone}@whatsapp.com`,
        deliveryMethod,
        paymentMethod,
        address: deliveryMethod === 'delivery' ? addressFields : null,
        items: cartItems,
        subtotal,
        deliveryFee: deliveryMethod === 'delivery' ? deliveryFee : 0,
        total: deliveryMethod === 'delivery' ? total : subtotal,
        amountPaid: paymentMethod === 'cash' ? parseFloat(cashAmount) : null,
        change: paymentMethod === 'cash' ? change : null,
        observations,
        storeSlug,
        status: 'PENDING'
      }

      // Generar mensaje de WhatsApp
      const whatsappMessage = generateWhatsAppMessage(orderData)
      
      // Abrir WhatsApp
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${storeInfo?.whatsappMainNumber}&text=${encodeURIComponent(whatsappMessage)}`
      window.open(whatsappUrl, '_blank')

      // Llamar callback
      onOrderComplete(orderData)
      
      toast.success('¡Pedido enviado! Revisa WhatsApp para confirmar.')
      
    } catch (error) {
      console.error('Error sending order:', error)
      toast.error('Error al enviar el pedido')
    } finally {
      setIsLoading(false)
    }
  }

  // Generar mensaje de WhatsApp
  const generateWhatsAppMessage = (orderData: any) => {
    let message = `🍽️ *NUEVO PEDIDO* - ${orderData.orderNumber}\n\n`
    
    // Información del cliente
    message += `👤 *Cliente:* ${orderData.customerName}\n`
    message += `📱 *Teléfono:* +52${orderData.customerWhatsApp}\n\n`
    
    // Dirección
    if (orderData.deliveryMethod === 'delivery' && orderData.address) {
      message += `📍 *Dirección de entrega:*\n`
      message += `• Calle: ${orderData.address.street}\n`
      message += `• Número: ${orderData.address.number}\n`
      message += `• Colonia: ${orderData.address.neighborhood}\n`
      if (orderData.address.reference) {
        message += `• Referencias: ${orderData.address.reference}\n`
      }
      message += `\n`
    } else {
      message += `🏪 *Recoger en local*\n\n`
    }
    
    // Resumen de precios
    message += `💰 *Resumen:*\n`
    message += `• Subtotal: $${orderData.subtotal.toFixed(2)}\n`
    if (orderData.deliveryFee > 0) {
      message += `• Envío: $${orderData.deliveryFee.toFixed(2)}\n`
    }
    message += `• Total: $${orderData.total.toFixed(2)}\n`
    message += `• Pago: ${orderData.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}\n`
    if (orderData.amountPaid) {
      message += `• Pagará con: $${orderData.amountPaid.toFixed(2)}\n`
      message += `• Cambio: $${orderData.change.toFixed(2)}\n`
    }
    message += `\n`
    
    // Productos
    message += `📋 *Pedido:*\n`
    orderData.items.forEach((item: any) => {
      message += `• ${item.quantity}x ${item.name} - $${item.price.toFixed(2)}\n`
    })
    
    if (orderData.observations) {
      message += `\n📝 *Observaciones:* ${orderData.observations}`
    }
    
    return message
  }

  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'info':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Información del Cliente</h2>
              <p className="text-gray-600">Completa tus datos para continuar</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-medium">Nombre completo *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="h-12 text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-base font-medium">Teléfono WhatsApp *</Label>
                <div className="flex">
                  <div className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-4 py-3 text-gray-700 font-medium">
                    +52
                  </div>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 dígitos"
                    className="h-12 text-base rounded-l-none border-l-0"
                    maxLength={10}
                  />
                </div>
                {customerPhone && !validateWhatsApp(customerPhone) && (
                  <p className="text-sm text-red-600 mt-1">El teléfono debe tener 10 dígitos</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" className="text-base font-medium">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="h-12 text-base"
                />
              </div>
            </div>
            
            <Button
              onClick={() => setCurrentStep('delivery')}
              disabled={!customerName.trim() || !validateWhatsApp(customerPhone)}
              className="w-full h-12 text-base font-medium"
            >
              Continuar
            </Button>
          </div>
        )

      case 'delivery':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Método de Entrega</h2>
              <p className="text-gray-600">¿Cómo quieres recibir tu pedido?</p>
            </div>
            
            <RadioGroup value={deliveryMethod} onValueChange={(value: 'pickup' | 'delivery') => setDeliveryMethod(value)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Store className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Recoger en local</p>
                        <p className="text-sm text-gray-600">Sin costo de envío</p>
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Entrega a domicilio</p>
                        <p className="text-sm text-gray-600">+${deliveryFee.toFixed(2)} de envío</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep('info')}
                variant="outline"
                className="flex-1 h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={() => setCurrentStep(deliveryMethod === 'delivery' ? 'location' : 'payment')}
                className="flex-1 h-12"
              >
                Continuar
              </Button>
            </div>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Ubicación de Entrega</h2>
              <p className="text-gray-600">Selecciona tu ubicación exacta</p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="w-full h-12 text-base"
                variant="outline"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Obtener mi ubicación con GPS
                  </>
                )}
              </Button>
              
              {showMap && (
                <LeafletInteractiveMap
                  onLocationSelect={handleLocationSelect}
                  initialValue={selectedAddress}
                  className="h-80 w-full"
                />
              )}
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="street" className="text-base font-medium">Calle *</Label>
                  <Input
                    id="street"
                    value={addressFields.street}
                    onChange={(e) => setAddressFields(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="Nombre de la calle"
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="number" className="text-base font-medium">Número *</Label>
                    <Input
                      id="number"
                      value={addressFields.number}
                      onChange={(e) => setAddressFields(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="123"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood" className="text-base font-medium">Colonia *</Label>
                    <Input
                      id="neighborhood"
                      value={addressFields.neighborhood}
                      onChange={(e) => setAddressFields(prev => ({ ...prev, neighborhood: e.target.value }))}
                      placeholder="Colonia"
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="houseType" className="text-base font-medium">Tipo de vivienda *</Label>
                  <Select value={addressFields.houseType} onValueChange={(value) => setAddressFields(prev => ({ ...prev, houseType: value }))}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Departamento">Departamento</SelectItem>
                      <SelectItem value="Edificio">Edificio</SelectItem>
                      <SelectItem value="Negocio">Negocio/Local</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="reference" className="text-base font-medium">Referencias</Label>
                  <Textarea
                    id="reference"
                    value={addressFields.reference}
                    onChange={(e) => setAddressFields(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Portón verde, casa esquina, etc."
                    className="min-h-[80px] text-base"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep('delivery')}
                variant="outline"
                className="flex-1 h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={() => setCurrentStep('payment')}
                disabled={!addressFields.street || !addressFields.neighborhood || !addressFields.number || !addressFields.houseType}
                className="flex-1 h-12"
              >
                Continuar
              </Button>
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Método de Pago</h2>
              <p className="text-gray-600">¿Cómo quieres pagar?</p>
            </div>
            
            <RadioGroup value={paymentMethod} onValueChange={(value: 'cash' | 'transfer') => setPaymentMethod(value)}>
              <div className="space-y-3">
                {storeInfo?.cashPaymentEnabled && (
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Banknote className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Efectivo</p>
                          <p className="text-sm text-gray-600">Paga al recibir</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                )}
                
                {storeInfo?.bankTransferEnabled && (
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Transferencia bancaria</p>
                          <p className="text-sm text-gray-600">Pago anticipado</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                )}
              </div>
            </RadioGroup>
            
            {/* Detalles de pago en efectivo */}
            {paymentMethod === 'cash' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-lg">Pago en Efectivo</h3>
                <div>
                  <Label htmlFor="cashAmount" className="text-base font-medium">Cantidad con la que pagarás</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <Input
                      id="cashAmount"
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0.00"
                      className="h-12 text-base pl-8"
                      step="0.01"
                      min={total}
                    />
                  </div>
                  {cashAmount && parseFloat(cashAmount) < total && (
                    <p className="text-sm text-red-600 mt-1">El monto debe ser mayor o igual al total</p>
                  )}
                  {change > 0 && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">Cambio: ${change.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Detalles de transferencia */}
            {paymentMethod === 'transfer' && storeInfo && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-lg">Datos para Transferencia</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div>
                      <p className="text-sm text-gray-600">Titular</p>
                      <p className="font-medium">{storeInfo.accountHolder}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(storeInfo.accountHolder, 'holder')}
                    >
                      {copiedField === 'holder' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div>
                      <p className="text-sm text-gray-600">Banco</p>
                      <p className="font-medium">{storeInfo.bankName}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div>
                      <p className="text-sm text-gray-600">No. de tarjeta</p>
                      <p className="font-medium font-mono">{storeInfo.accountNumber}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(storeInfo.accountNumber, 'account')}
                    >
                      {copiedField === 'account' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {storeInfo.clabe && (
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm text-gray-600">CLABE</p>
                        <p className="font-medium font-mono">{storeInfo.clabe}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(storeInfo.clabe, 'clabe')}
                      >
                        {copiedField === 'clabe' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Al finalizar envía el comprobante vía WhatsApp
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep(deliveryMethod === 'delivery' ? 'location' : 'delivery')}
                variant="outline"
                className="flex-1 h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={() => setCurrentStep('summary')}
                disabled={paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)}
                className="flex-1 h-12"
              >
                Continuar
              </Button>
            </div>
          </div>
        )

      case 'summary':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Resumen del Pedido</h2>
              <p className="text-gray-600">Revisa tu pedido antes de enviar</p>
            </div>
            
            {/* Resumen de productos */}
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Productos</h3>
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.quantity}x {item.name}</p>
                    {item.variantName && (
                      <p className="text-sm text-gray-600">{item.variantName}</p>
                    )}
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            {/* Resumen de precios */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${(deliveryMethod === 'delivery' ? total : subtotal).toFixed(2)}</span>
              </div>
            </div>
            
            {/* Información del cliente */}
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Información del Cliente</h3>
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>+52{customerPhone}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{addressFields.street} {addressFields.number}, {addressFields.neighborhood}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Observaciones */}
            <div>
              <Label htmlFor="observations" className="text-base font-medium">Observaciones adicionales</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Algo que quieras agregar a tu pedido..."
                className="min-h-[80px] text-base mt-2"
              />
            </div>
            
            {/* Términos y condiciones */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                Acepto los{' '}
                <a href="#" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                  términos y condiciones
                </a>
                {' '}y el procesamiento de mis datos personales.
              </Label>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep('payment')}
                variant="outline"
                className="flex-1 h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={handleSubmitOrder}
                disabled={isLoading || !termsAccepted}
                className="flex-1 h-12 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Enviar por WhatsApp
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-8">
      <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 pb-4">
          <div className="flex items-center gap-3">
            {currentStep !== 'info' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (currentStep === 'delivery') setCurrentStep('info')
                  else if (currentStep === 'location') setCurrentStep('delivery')
                  else if (currentStep === 'payment') setCurrentStep(deliveryMethod === 'delivery' ? 'location' : 'delivery')
                  else if (currentStep === 'summary') setCurrentStep('payment')
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-xl font-bold">Finalizar Pedido</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto flex-1 pb-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>
    </div>
  )
}
