'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Banknote, Building2, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentSettingsProps {
  settings: any
  setSettings: (settings: any) => void
}

interface PaymentConfig {
  paymentsEnabled: boolean
  cashPaymentEnabled: boolean
  cashPaymentInstructions: string
  bankTransferEnabled: boolean
  bankName: string
  accountNumber: string
  accountHolder: string
  clabe: string
  transferInstructions: string
  paymentInstructions: string
}

export default function PaymentSettings({ settings, setSettings }: PaymentSettingsProps) {
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    paymentsEnabled: true,
    cashPaymentEnabled: true,
    cashPaymentInstructions: '',
    bankTransferEnabled: false,
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    clabe: '',
    transferInstructions: '',
    paymentInstructions: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPaymentSettings()
  }, [])

  const loadPaymentSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/settings', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        // Asegurar que todos los campos string tengan valores por defecto
        setPaymentConfig({
          paymentsEnabled: data.paymentsEnabled ?? true,
          cashPaymentEnabled: data.cashPaymentEnabled ?? true,
          cashPaymentInstructions: data.cashPaymentInstructions ?? '',
          bankTransferEnabled: data.bankTransferEnabled ?? false,
          bankName: data.bankName ?? '',
          accountNumber: data.accountNumber ?? '',
          accountHolder: data.accountHolder ?? '',
          clabe: data.clabe ?? '',
          transferInstructions: data.transferInstructions ?? '',
          paymentInstructions: data.paymentInstructions ?? ''
        })
      }
    } catch (error) {
      console.error('Error loading payment settings:', error)
      toast.error('Error al cargar la configuración de pagos')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...settings,
          ...paymentConfig
        })
      })

      if (response.ok) {
        toast.success('Configuración de pagos guardada')
        // Actualizar el estado global
        setSettings({
          ...settings,
          ...paymentConfig
        })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error saving payment settings:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const updatePaymentConfig = (field: keyof PaymentConfig, value: any) => {
    setPaymentConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuración General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Configuración General de Pagos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Habilita o deshabilita los métodos de pago disponibles
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="payments-enabled">Habilitar sistema de pagos</Label>
              <p className="text-sm text-muted-foreground">
                Activa el sistema de pagos para tu tienda
              </p>
            </div>
            <Switch
              id="payments-enabled"
              checked={paymentConfig.paymentsEnabled}
              onCheckedChange={(checked) => updatePaymentConfig('paymentsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pago en Efectivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Pago en Efectivo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura las opciones para pagos en efectivo
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cash-enabled">Habilitar pago en efectivo</Label>
              <p className="text-sm text-muted-foreground">
                Permite a los clientes pagar en efectivo
              </p>
            </div>
            <Switch
              id="cash-enabled"
              checked={paymentConfig.cashPaymentEnabled}
              onCheckedChange={(checked) => updatePaymentConfig('cashPaymentEnabled', checked)}
            />
          </div>

          {paymentConfig.cashPaymentEnabled && (
            <div className="space-y-2">
              <Label htmlFor="cash-instructions">Instrucciones para pago en efectivo</Label>
              <Textarea
                id="cash-instructions"
                placeholder="Ej: El pago se realiza al momento de la entrega. Ten el monto exacto preparado."
                value={paymentConfig.cashPaymentInstructions || ''}
                onChange={(e) => updatePaymentConfig('cashPaymentInstructions', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transferencia Bancaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Transferencia Bancaria
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura los datos bancarios para transferencias
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bank-enabled">Habilitar transferencia bancaria</Label>
              <p className="text-sm text-muted-foreground">
                Permite a los clientes pagar por transferencia
              </p>
            </div>
            <Switch
              id="bank-enabled"
              checked={paymentConfig.bankTransferEnabled}
              onCheckedChange={(checked) => updatePaymentConfig('bankTransferEnabled', checked)}
            />
          </div>

          {paymentConfig.bankTransferEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Nombre del banco</Label>
                  <Input
                    id="bank-name"
                    placeholder="Ej: BBVA, Santander, Banorte"
                    value={paymentConfig.bankName || ''}
                    onChange={(e) => updatePaymentConfig('bankName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-holder">Titular de la cuenta</Label>
                  <Input
                    id="account-holder"
                    placeholder="Nombre completo del titular"
                    value={paymentConfig.accountHolder || ''}
                    onChange={(e) => updatePaymentConfig('accountHolder', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-number">Número de cuenta</Label>
                  <Input
                    id="account-number"
                    placeholder="Número de cuenta bancaria"
                    value={paymentConfig.accountNumber || ''}
                    onChange={(e) => updatePaymentConfig('accountNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clabe">CLABE interbancaria</Label>
                  <Input
                    id="clabe"
                    placeholder="18 dígitos"
                    value={paymentConfig.clabe || ''}
                    onChange={(e) => updatePaymentConfig('clabe', e.target.value)}
                    maxLength={18}
                  />
                  {paymentConfig.clabe && paymentConfig.clabe.length !== 18 && (
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      La CLABE debe tener exactamente 18 dígitos
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-instructions">Instrucciones para transferencia</Label>
                <Textarea
                  id="transfer-instructions"
                  placeholder="Ej: Realiza la transferencia y envía el comprobante por WhatsApp. Incluye tu número de pedido en el concepto."
                value={paymentConfig.transferInstructions || ''}
                onChange={(e) => updatePaymentConfig('transferInstructions', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instrucciones Generales */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones Generales de Pago</CardTitle>
          <p className="text-sm text-muted-foreground">
            Información adicional que verán los clientes sobre los métodos de pago
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="general-instructions">Instrucciones generales</Label>
            <Textarea
              id="general-instructions"
              placeholder="Ej: Todos los pagos deben confirmarse antes de la entrega. Para transferencias, envía el comprobante por WhatsApp."
            value={paymentConfig.paymentInstructions || ''}
            onChange={(e) => updatePaymentConfig('paymentInstructions', e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumen de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sistema de pagos:</span>
              <span className={`text-sm font-medium ${paymentConfig.paymentsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {paymentConfig.paymentsEnabled ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Pago en efectivo:</span>
              <span className={`text-sm font-medium ${paymentConfig.cashPaymentEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {paymentConfig.cashPaymentEnabled ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Transferencia bancaria:</span>
              <span className={`text-sm font-medium ${paymentConfig.bankTransferEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {paymentConfig.bankTransferEnabled ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </div>

            {paymentConfig.bankTransferEnabled && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Datos bancarios configurados:</p>
                <p className="text-sm text-blue-700">{paymentConfig.bankName} - {paymentConfig.accountHolder}</p>
                <p className="text-sm text-blue-700">Cuenta: {paymentConfig.accountNumber}</p>
                {paymentConfig.clabe && (
                  <p className="text-sm text-blue-700">CLABE: {paymentConfig.clabe}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}
