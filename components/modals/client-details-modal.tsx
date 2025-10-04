"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, User, Building, Calendar, Phone, Mail, ExternalLink, Store } from "lucide-react"
import { format } from "date-fns"
import { es } from 'date-fns/locale'

interface ClientDetails {
  id: string
  email: string
  name?: string
  company?: string
  role: string
  isActive: boolean
  createdAt: string
  storeSettings?: {
    id: string
    storeName: string
    storeSlug: string
    storeActive: boolean
    whatsappMainNumber?: string
  } | null
  invitation: {
    id: string
    clientName: string
    clientPhone?: string
    status: 'PENDING' | 'USED' | 'EXPIRED' | 'CANCELLED'
    serviceRenewal?: string
    isActive: boolean
  } | null
}

interface ClientDetailsModalProps {
  clientId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ClientDetailsModal({ clientId, isOpen, onClose }: ClientDetailsModalProps) {
  const [client, setClient] = useState<ClientDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientDetails(clientId)
    }
  }, [isOpen, clientId])

  const fetchClientDetails = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/clients/${id}`)
      if (!res.ok) {
        throw new Error('Failed to fetch client details')
      }
      const data = await res.json()
      setClient(data)
    } catch (error) {
      console.error('Error fetching client details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
      case 'PENDING': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'EXPIRED': return <Badge variant="destructive" className="bg-red-100 text-red-800">Expirado</Badge>
      case 'CANCELLED': return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cancelado</Badge>
      default: return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const openStoreInNewWindow = () => {
    if (client?.storeSettings?.storeSlug) {
      const storeUrl = `${window.location.origin}/tienda/${client.storeSettings.storeSlug}`
      window.open(storeUrl, '_blank', 'noopener,noreferrer')
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Información del Cliente</span>
            <div className="flex items-center space-x-2">
              {client?.isActive && getStatusBadge('ACTIVE')}
              {client?.invitation && getStatusBadge(client.invitation.status)}
            </div>
          </DialogTitle>
          <DialogDescription>
            Datos básicos del cliente
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="ml-2">Cargando...</div>
          </div>
        ) : client ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Nombre */}
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Nombre</p>
                    <p className="text-sm text-muted-foreground">{client.name || 'No especificado'}</p>
                  </div>
                </div>

                {/* Empresa */}
                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Empresa</p>
                    <p className="text-sm text-muted-foreground">{client.company || 'No especificada'}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>

                {/* WhatsApp/Teléfono */}
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">
                      {client.storeSettings?.whatsappMainNumber || client.invitation?.clientPhone || 'No especificado'}
                    </p>
                  </div>
                </div>

                {/* Información de la Tienda */}
                {client.storeSettings && (
                  <div className="flex items-center space-x-3">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Tienda</p>
                      <p className="text-sm text-muted-foreground">{client.storeSettings.storeName}</p>
                      <p className="text-xs text-muted-foreground">
                        URL: /tienda/{client.storeSettings.storeSlug}
                      </p>
                    </div>
                  </div>
                )}

                {/* Próxima Renovación */}
                {client.invitation?.serviceRenewal && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Próxima Renovación</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(client.invitation.serviceRenewal), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botón para abrir la tienda */}
            {client?.storeSettings?.storeSlug && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={openStoreInNewWindow}
                  className="w-full"
                  variant="outline"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Ver Tienda Pública
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Abrirá en una nueva ventana: {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002'}/tienda/{client.storeSettings.storeSlug}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No se pudieron cargar los detalles del cliente
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
