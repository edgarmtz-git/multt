'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Home,
  Store,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  X,
  Truck
} from 'lucide-react'
import { toast } from 'sonner'
import { validateWhatsAppNumber } from '@/lib/geolocation'
import DeliveryAddressSection from './delivery-address-section'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  variantName?: string
  variantId?: string
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
  cashPaymentInstructions: string
  deliveryFee: number
  freeDeliveryMinAmount?: number
  freeDeliveryMinItems?: number
  deliveryCalculationMethod: 'distance' | 'zones' | 'manual'
  pricePerKm?: number
  minDeliveryFee?: number
  maxDeliveryDistance?: number
  manualDeliveryMessage?: string
}

interface DeliveryZone {
  id: string
  name: string
  type: string
  fixedPrice?: number
  freeDeliveryThreshold?: number
  estimatedTime?: number
  description?: string
  order: number
}

interface SingleCardCheckoutProps {
  storeSlug: string
  cartItems: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  onOrderComplete: (orderData: any) => void
  onClose?: () => void
}

export default function SingleCardCheckout({
  storeSlug,
  cartItems,
  subtotal,
  deliveryFee,
  total,
  onOrderComplete,
  onClose
}: SingleCardCheckoutProps) {
  // Estados principales
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Debug: Log de datos recibidos (solo una vez)
  useEffect(() => {
    console.log('🏪 Checkout received data:', {
      storeSlug,
      cartItemsCount: cartItems.length,
      cartItems: JSON.stringify(cartItems, null, 2),
      subtotal,
      deliveryFee,
      total
    })
  }, [storeSlug, cartItems, subtotal, deliveryFee, total])

  // Información del cliente
  const [customerName, setCustomerName] = useState('')
  const [customerWhatsApp, setCustomerWhatsApp] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  // Método de entrega
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')

  // Ubicación
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

  // Estados para cálculo de envío
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0)
  const [deliveryCalculation, setDeliveryCalculation] = useState<{
    distance?: number
    method?: string
    message?: string
    isWithinRange?: boolean
    zone?: string
    price?: number
    estimatedTime?: number
  } | null>(null)

  // Método de pago
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')
  const [cashAmount, setCashAmount] = useState('')
  const [change, setChange] = useState(0)

  // ✅ IMPORTANTE: Si deliveryEnabled = false, forzar pickup
  useEffect(() => {
    if (storeInfo && !storeInfo.deliveryEnabled && deliveryMethod === 'delivery') {
      setDeliveryMethod('pickup')
      toast.info('Esta tienda solo ofrece recoger en local')
    }
  }, [storeInfo, deliveryMethod])

  // Observaciones
  const [observations, setObservations] = useState('')

  // Estados de UI
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Cargar información de la tienda y zonas
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await fetch(`/api/store/${storeSlug}`)
        if (response.ok) {
          const data = await response.json()
          console.log('🏪 Store Info loaded:', {
            deliveryEnabled: data.deliveryEnabled,
            deliveryCalculationMethod: data.deliveryCalculationMethod
          })
          setStoreInfo(data)

          // Si el método es por zonas, cargar las zonas
          if (data.deliveryCalculationMethod === 'zones') {
            const zonesResponse = await fetch(`/api/store/${storeSlug}/delivery-zones`)
            if (zonesResponse.ok) {
              const zonesData = await zonesResponse.json()
              setDeliveryZones(zonesData.deliveryZones || [])
            }
          }
        }
      } catch (error) {
        console.error('Error fetching store info:', error)
      }
    }

    fetchStoreInfo()
  }, [storeSlug])

  // Validar WhatsApp
  const validateWhatsApp = validateWhatsAppNumber

  // Calcular cambio
  useEffect(() => {
    if (paymentMethod === 'cash' && cashAmount) {
      const amount = parseFloat(cashAmount)
      const currentTotal = deliveryMethod === 'delivery' ? (total || 0) : (subtotal || 0)
      const calculatedChange = amount - currentTotal
      setChange(calculatedChange > 0 ? calculatedChange : 0)
    } else {
      setChange(0)
    }
  }, [cashAmount, total, subtotal, deliveryMethod, paymentMethod])

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
    if (!customerWhatsApp.trim() || !validateWhatsApp(customerWhatsApp)) {
      toast.error('El WhatsApp debe tener 10 dígitos')
      return false
    }
    if (deliveryMethod === 'delivery') {
      if (!addressFields.street || !addressFields.neighborhood || !addressFields.number || !addressFields.houseType) {
        toast.error('Completa todos los campos de dirección obligatorios')
        return false
      }
    }
    if (paymentMethod === 'cash' && cashAmount) {
      const currentTotal = deliveryMethod === 'delivery' ? (total || 0) : (subtotal || 0)
      if (parseFloat(cashAmount) < currentTotal) {
        toast.error('El monto en efectivo debe ser mayor o igual al total')
        return false
      }
    }
    return true
  }

  // Enviar pedido
  const handleSubmitOrder = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Transformar items del carrito al formato esperado por la API
      const formattedItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variantName: item.variantName,
        variantId: item.variantId || null,
        options: item.options || []
      }))

      const orderData = {
        orderNumber: `PED${Date.now()}`,
        customerName,
        customerWhatsApp,
        customerEmail: customerEmail.trim() || undefined,
        deliveryMethod,
        paymentMethod,
        address: deliveryMethod === 'delivery' ? addressFields : null,
        items: formattedItems,
        subtotal: subtotal || 0,
        deliveryFee: deliveryMethod === 'delivery' ? (deliveryCalculation ? calculatedDeliveryFee : (deliveryFee || 0)) : 0,
        total: deliveryMethod === 'delivery' ? ((subtotal || 0) + (deliveryCalculation ? calculatedDeliveryFee : (deliveryFee || 0))) : (subtotal || 0),
        amountPaid: paymentMethod === 'cash' ? parseFloat(cashAmount) : null,
        change: paymentMethod === 'cash' ? change : null,
        observations,
        storeSlug,
        status: 'PENDING'
      }

      // Crear pedido en el sistema
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}))
        console.error('❌ Error del servidor:', errorData)
        throw new Error(errorData.error || 'Error al crear pedido en el sistema')
      }

      const orderResult = await orderResponse.json()
      console.log('✅ Pedido creado en sistema:', orderResult)

      // Generar mensaje de WhatsApp
      const whatsappMessage = generateWhatsAppMessage(orderData, orderResult.order?.id)
      
      // Abrir WhatsApp
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${storeInfo?.whatsappMainNumber}&text=${encodeURIComponent(whatsappMessage)}`
      window.open(whatsappUrl, '_blank')

      // Llamar callback
      onOrderComplete(orderData)
      
      toast.success('¡Pedido creado y enviado! Revisa WhatsApp para confirmar.')
      
    } catch (error) {
      console.error('Error sending order:', error)
      toast.error('Error al enviar el pedido')
    } finally {
      setIsLoading(false)
    }
  }

  // Generar mensaje de WhatsApp
  const generateWhatsAppMessage = (orderData: any, orderId?: string) => {
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
    
    // Información de envío según el método configurado
    if (orderData.deliveryMethod === 'delivery') {
      if (deliveryCalculation) {
        const calc = deliveryCalculation as any // Type assertion for legacy delivery calculation
        switch (calc.method) {
          case 'distance':
            if (calc.price > 0) {
              message += `• Envío (${calc.distance} km): $${calc.price.toFixed(2)}\n`
            } else {
              message += `• Envío: Gratis\n`
            }
            break
          case 'zones':
            if (calc.price > 0) {
              message += `• Envío por zona: $${calc.price.toFixed(2)}\n`
            } else {
              message += `• Envío por zona: Gratis\n`
            }
            break
          case 'manual':
            message += `• Envío: ${deliveryCalculation.message}\n`
            break
          default:
            if (orderData.deliveryFee > 0) {
              message += `• Envío: $${orderData.deliveryFee.toFixed(2)}\n`
            } else {
              message += `• Envío: Gratis\n`
            }
        }
      } else if (orderData.deliveryFee > 0) {
        message += `• Envío: $${orderData.deliveryFee.toFixed(2)}\n`
      } else {
        message += `• Envío: Gratis\n`
      }
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
      if (item.variantName) {
        message += `  - Variante: ${item.variantName}\n`
      }
      if (item.options && item.options.length > 0) {
        item.options.forEach((option: any) => {
          message += `  - ${option.name}: ${option.value}\n`
        })
      }
    })
    
    if (orderData.observations) {
      message += `\n📝 *Observaciones:* ${orderData.observations}`
    }
    
    // Agregar enlace de seguimiento si hay orderId
    if (orderId) {
      message += `\n\n🔗 *Seguimiento:* Puedes ver el estado de tu pedido en:`
      message += `\n${window.location.origin}/tracking/order/${orderId}`
    }
    
    return message
  }

  return (
      <Card className="w-full h-screen md:h-auto md:max-w-3xl lg:max-w-4xl xl:max-w-5xl md:max-h-[90vh] overflow-hidden flex flex-col md:rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle className="text-2xl font-bold">Finalizar Pedido</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto flex-1 pb-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName" className="text-sm font-medium">Nombre completo *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="mt-1 h-12 text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="customerWhatsApp" className="text-sm font-medium">WhatsApp *</Label>
                <div className="flex mt-1">
                  <div className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-gray-700 text-sm h-12 flex items-center">
                    +52
                  </div>
                  <Input
                    id="customerWhatsApp"
                    value={customerWhatsApp}
                    onChange={(e) => setCustomerWhatsApp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 dígitos"
                    className="rounded-l-none border-l-0 h-12 text-base"
                    maxLength={10}
                  />
                </div>
                {customerWhatsApp && !validateWhatsApp(customerWhatsApp) && (
                  <p className="text-xs text-red-600 mt-1">El WhatsApp debe tener 10 dígitos</p>
                )}
              </div>
            </div>
            
          </div>

          {/* Método de Entrega */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Store className="h-5 w-5" />
              Método de Entrega
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="delivery-method">Selecciona el método de entrega *</Label>
              <Select value={deliveryMethod} onValueChange={(value: 'pickup' | 'delivery') => setDeliveryMethod(value)}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Elige cómo quieres recibir tu pedido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">
                    <div className="flex items-center gap-3">
                      <Store className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Recoger en local</p>
                        <p className="text-sm text-gray-600">Sin costo de envío</p>
                      </div>
                    </div>
                  </SelectItem>
                  {/* Solo mostrar opción de delivery si está habilitado en la tienda */}
                  {storeInfo?.deliveryEnabled && (
                    <SelectItem value="delivery">
                      <div className="flex items-center gap-3">
                        <Home className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="font-medium">Entrega a domicilio</p>
                          <p className="text-sm text-gray-600">
                            {deliveryCalculation && calculatedDeliveryFee > 0 ? (
                              `+$${calculatedDeliveryFee.toFixed(2)} de envío`
                            ) : (
                              'Costo calculado al seleccionar dirección'
                            )}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ubicación de Entrega - Componente dinámico según método */}
          {deliveryMethod === 'delivery' && storeInfo && (
            <>
              <Separator />
              <DeliveryAddressSection
                deliveryMethod={deliveryMethod}
                calculationMethod={storeInfo.deliveryCalculationMethod}
                storeSlug={storeSlug}
                deliveryZones={deliveryZones}
                pricePerKm={storeInfo.pricePerKm}
                minDeliveryFee={storeInfo.minDeliveryFee}
                maxDeliveryDistance={storeInfo.maxDeliveryDistance}
                manualDeliveryMessage={storeInfo.manualDeliveryMessage}
                subtotal={subtotal}
                addressFields={addressFields}
                setAddressFields={setAddressFields}
                selectedZone={selectedZone}
                setSelectedZone={setSelectedZone}
                calculatedDeliveryFee={calculatedDeliveryFee}
                setCalculatedDeliveryFee={setCalculatedDeliveryFee}
                deliveryCalculation={deliveryCalculation}
                setDeliveryCalculation={setDeliveryCalculation}
              />
            </>
          )}

          {/* Método de Pago */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de Pago
            </h3>
            
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
                <h4 className="font-medium">Pago en Efectivo</h4>
                <div>
                  <Label htmlFor="cashAmount" className="text-sm font-medium">Cantidad con la que pagarás</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="cashAmount"
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-8 h-12 text-base"
                      step="0.01"
                      min={deliveryMethod === 'delivery' ? (total || 0) : (subtotal || 0)}
                    />
                  </div>
                  {cashAmount && parseFloat(cashAmount) < (deliveryMethod === 'delivery' ? (total || 0) : (subtotal || 0)) && (
                    <p className="text-xs text-red-600 mt-1">El monto debe ser mayor o igual al total</p>
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
                <h4 className="font-medium">Datos para Transferencia</h4>
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
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observations" className="text-sm font-medium">Observaciones adicionales</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Algo que quieras agregar a tu pedido..."
              className="min-h-[80px] text-base"
            />
          </div>

          {/* Resumen del Pedido */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold">Resumen del Pedido</h3>
            
            {/* Información del método de envío */}
            {deliveryMethod === 'delivery' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-700">
                  {deliveryCalculation && deliveryCalculation.method ? (
                    <>
                      {deliveryCalculation.method === 'distance' && (
                        <div className="space-y-1">
                          <span>💰 <strong>Costo:</strong> Por distancia</span>
                          <div className="text-xs text-blue-600 ml-4">
                            📍 Distancia: {deliveryCalculation.distance} km
                          </div>
                        </div>
                      )}
                      {deliveryCalculation.method === 'zones' && (
                        <span>💰 <strong>Costo:</strong> Por zonas</span>
                      )}
                      {deliveryCalculation.method === 'manual' && (
                        <span>💰 <strong>Costo:</strong> Manual ({deliveryCalculation.message || 'El costo se confirmará después del pedido'})</span>
                      )}
                      {!['distance', 'zones', 'manual'].includes(deliveryCalculation.method) && (
                        <span>💰 <strong>Costo:</strong> Tarifa fija</span>
                      )}
                    </>
                  ) : (
                    <span>💰 <strong>Costo:</strong> Se calculará según tu ubicación</span>
                  )}
                </div>
              </div>
            )}
            
            
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.quantity}x {item.name}</p>
                    {item.variantName && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {item.variantName}
                      </Badge>
                    )}
                    {item.options && item.options.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {item.options.map((option, optIndex) => (
                          <p key={optIndex}>- {option.name}: {option.value}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="font-medium">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${(subtotal || 0).toFixed(2)}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>
                    {deliveryCalculation && calculatedDeliveryFee >= 0 ? (
                      `$${calculatedDeliveryFee.toFixed(2)}`
                    ) : (
                      '$0.00'
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>
                  {deliveryMethod === 'delivery' ? (
                    deliveryCalculation && calculatedDeliveryFee >= 0 ? (
                      `$${((subtotal || 0) + calculatedDeliveryFee).toFixed(2)}`
                    ) : (
                      `$${(subtotal || 0).toFixed(2)}`
                    )
                  ) : (
                    `$${(subtotal || 0).toFixed(2)}`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de Envío */}
          <Button
            onClick={handleSubmitOrder}
            disabled={isLoading || !customerName.trim() || !validateWhatsApp(customerWhatsApp)}
            className="w-full h-12 text-base font-medium"
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
        </CardContent>
      </Card>
  )
}
