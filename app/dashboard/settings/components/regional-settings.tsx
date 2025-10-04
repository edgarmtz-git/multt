'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'

interface RegionalSettingsProps {
  settings: any
  setSettings: (settings: any) => void
}

export default function RegionalSettings({ settings, setSettings }: RegionalSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Configuración regional
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configura la región, idioma, moneda y unidades de medida
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">País</Label>
            <Select value={settings.country} onValueChange={(value) => setSettings((prev: any) => ({ ...prev, country: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mexico">México</SelectItem>
                <SelectItem value="US">Estados Unidos</SelectItem>
                <SelectItem value="CA">Canadá</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="language">Idioma</Label>
            <Select value={settings.language} onValueChange={(value) => setSettings((prev: any) => ({ ...prev, language: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Moneda</Label>
            <Select value={settings.currency} onValueChange={(value) => setSettings((prev: any) => ({ ...prev, currency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                <SelectItem value="CAD">CAD - Dólar Canadiense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="distanceUnit">Unidad de distancia</Label>
            <Select value={settings.distanceUnit} onValueChange={(value) => setSettings((prev: any) => ({ ...prev, distanceUnit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="km">Kilómetros</SelectItem>
                <SelectItem value="mi">Millas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
