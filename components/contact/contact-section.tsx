'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MapPin, Clock } from 'lucide-react'
import WhatsAppContact from './whatsapp-contact'

interface ContactSectionProps {
  storeSlug: string
  storeInfo?: {
    email?: string
    address?: any
    businessHours?: any
  }
  className?: string
}

export default function ContactSection({ 
  storeSlug, 
  storeInfo, 
  className = '' 
}: ContactSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* WhatsApp Contact */}
      <WhatsAppContact storeSlug={storeSlug} />
      
      {/* Email Contact */}
      {storeInfo?.email && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                También puedes contactarnos por email:
              </p>
              <a 
                href={`mailto:${storeInfo.email}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {storeInfo.email}
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address */}
      {storeInfo?.address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Nuestra ubicación:
              </p>
              <p className="text-sm font-medium">
                {storeInfo.address.address}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Hours */}
      {storeInfo?.businessHours && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios de Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Horarios de atención:
              </p>
              <div className="text-sm">
                {/* Aquí se pueden mostrar los horarios si están configurados */}
                <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                <p>Sábados: 9:00 AM - 2:00 PM</p>
                <p>Domingos: Cerrado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
