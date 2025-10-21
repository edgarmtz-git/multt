'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Globe, Clock } from 'lucide-react'

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

        <Separator />

        {/* Horarios de servicio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label htmlFor="enableBusinessHours" className="text-base font-medium">
                  Horarios de servicio
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {settings.enableBusinessHours
                  ? 'Los horarios configurados en "Disponibilidad" controlan si tu tienda aparece como abierta o cerrada'
                  : 'Tu tienda aparecerá siempre como abierta, independientemente de los horarios configurados'}
              </p>
            </div>
            <Switch
              id="enableBusinessHours"
              checked={settings.enableBusinessHours || false}
              onCheckedChange={(checked) => setSettings((prev: any) => ({ ...prev, enableBusinessHours: checked }))}
            />
          </div>

          {settings.enableBusinessHours && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-blue-900">
                    Horarios activos
                  </p>
                  <p className="text-sm text-blue-700">
                    Los clientes verán si tu tienda está "Abierto" o "Cerrado" según los horarios que configures en la sección <strong>Disponibilidad</strong>. Cuando esté cerrado, no podrán agregar productos al carrito.
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Tip: Ve a Disponibilidad para configurar tus días y horarios de atención
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
