'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface TrackingLinkCardProps {
  orderId: string
  orderNumber: string
}

export function TrackingLinkCard({ orderId, orderNumber }: TrackingLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const trackingUrl = `${window.location.origin}/tracking/order/${orderId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl)
      setCopied(true)
      toast.success('Link copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Error al copiar el link')
    }
  }

  const handleOpen = () => {
    window.open(trackingUrl, '_blank')
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Link de Seguimiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Comparte este link con tu cliente para que pueda ver el estado de su pedido en tiempo real
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </>
            )}
          </Button>
          <Button
            onClick={handleOpen}
            variant="default"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir
          </Button>
        </div>
        <div className="p-2 bg-white rounded border text-xs font-mono truncate">
          {trackingUrl}
        </div>
      </CardContent>
    </Card>
  )
}
