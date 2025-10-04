'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Store, Globe, MapPin, CreditCard } from 'lucide-react'
import ProfileSettings from './profile-settings'
import RegionalSettings from './regional-settings'
import DeliverySettings from './delivery-settings'
import PaymentSettings from './payment-settings'

interface SettingsLayoutProps {
  settings: any
  setSettings: (settings: any) => void
  onSave: () => void
  saving: boolean
}

export default function SettingsLayout({ 
  settings, 
  setSettings, 
  onSave, 
  saving 
}: SettingsLayoutProps) {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          Perfil
        </TabsTrigger>
        <TabsTrigger value="regional" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Regional
        </TabsTrigger>
        <TabsTrigger value="deliveries" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Entregas
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Pagos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <ProfileSettings 
          settings={settings} 
          setSettings={setSettings}
        />
      </TabsContent>

      <TabsContent value="regional" className="space-y-6">
        <RegionalSettings 
          settings={settings} 
          setSettings={setSettings}
        />
      </TabsContent>

      <TabsContent value="deliveries" className="space-y-6">
        <DeliverySettings 
          settings={settings} 
          setSettings={setSettings}
          onSave={onSave}
        />
      </TabsContent>

      <TabsContent value="payments" className="space-y-6">
        <PaymentSettings 
          settings={settings} 
          setSettings={setSettings}
        />
      </TabsContent>
    </Tabs>
  )
}
