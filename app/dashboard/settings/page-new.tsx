'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import SettingsLayout from './components/settings-layout'

interface StoreSettings {
  id?: string
  storeName: string
  storeSlug: string
  email?: string
  address?: any
  country: string
  language: string
  currency: string
  distanceUnit: string
  taxRate: number
  taxMethod: string
  enableBusinessHours: boolean
  disableCheckoutOutsideHours: boolean
  deliveryEnabled: boolean
  useBasePrice: boolean
  baseDeliveryPrice?: number
  baseDeliveryThreshold?: number
  paymentsEnabled: boolean
  storeActive: boolean
  passwordProtected: boolean
  accessPassword?: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Mi Tienda',
    storeSlug: '',
    country: 'Mexico',
    language: 'es',
    currency: 'MXN',
    distanceUnit: 'km',
    taxRate: 0.0,
    taxMethod: 'included',
    enableBusinessHours: false,
    disableCheckoutOutsideHours: false,
    deliveryEnabled: false,
    useBasePrice: false,
    baseDeliveryPrice: 0,
    baseDeliveryThreshold: 0,
    paymentsEnabled: true,
    storeActive: true,
    passwordProtected: false
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Error al cargar la configuración')
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
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Configuración guardada')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">
              Gestiona la configuración de tu tienda
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>

        <SettingsLayout 
          settings={settings}
          setSettings={setSettings}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </DashboardLayout>
  )
}
