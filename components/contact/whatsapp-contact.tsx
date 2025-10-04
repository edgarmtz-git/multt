'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Phone, Users, ExternalLink } from 'lucide-react'

interface WhatsAppContactProps {
  storeSlug: string
  className?: string
}

interface ContactConfig {
  whatsappMainNumber?: string
  phoneNumber?: string
}

export default function WhatsAppContact({ storeSlug, className = '' }: WhatsAppContactProps) {
  const [contactConfig, setContactConfig] = useState<ContactConfig>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadContactConfig()
  }, [storeSlug])

  const loadContactConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/store/${storeSlug}/contact-config`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setContactConfig(data)
      } else {
        setError('No se pudo cargar la configuración de contacto')
      }
    } catch (error) {
      console.error('Error loading contact config:', error)
      setError('Error al cargar la configuración de contacto')
    } finally {
      setLoading(false)
    }
  }

  const openWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${cleanNumber}`
    window.open(whatsappUrl, '_blank')
  }


  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si no hay configuración de contacto
  if (!contactConfig.whatsappMainNumber && !contactConfig.phoneNumber) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Información de Contacto
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Contáctanos directamente por WhatsApp o teléfono
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WhatsApp */}
        {contactConfig.whatsappMainNumber && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">WhatsApp</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Mensaje
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {contactConfig.whatsappMainNumber}
              </span>
              <Button
                size="sm"
                onClick={() => openWhatsApp(contactConfig.whatsappMainNumber!)}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Escribir
              </Button>
            </div>
          </div>
        )}

        {/* Teléfono */}
        {contactConfig.phoneNumber && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Teléfono</span>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Llamada
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {contactConfig.phoneNumber}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const cleanNumber = contactConfig.phoneNumber!.replace(/\D/g, '')
                  const phoneUrl = `tel:${cleanNumber}`
                  window.open(phoneUrl, '_self')
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
            </div>
          </div>
        )}


        {/* Información adicional */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Haz clic en "Escribir" para abrir WhatsApp directamente con un mensaje pre-escrito.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
