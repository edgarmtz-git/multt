"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Copy, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Mail,
  Phone,
  User,
  Trash2,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { useSlugValidation, useEmailValidation } from "@/lib/hooks/useValidation"

interface Invitation {
  id: string
  code: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  slug: string
  status: 'PENDING' | 'USED' | 'EXPIRED' | 'CANCELLED'
  expiresAt: string
  usedAt?: string
  createdAt: string
  serviceStart?: string
  serviceRenewal?: string
  isActive: boolean
}

export default function AdminInvitationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [deletingInvitationId, setDeletingInvitationId] = useState<string | null>(null)
  const [newInvitation, setNewInvitation] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    slug: '',
    expiresInDays: 7
  })

  // Usar los hooks de validación
  const slugValidation = useSlugValidation(newInvitation.slug)
  const emailValidation = useEmailValidation(newInvitation.clientEmail)

  // Verificar que sea admin
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Cargar invitaciones
  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      loadInvitations()
    }
  }, [session])

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/admin/invitations', {
        cache: 'no-store', // Evitar cache
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setInvitations(data)
      }
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Las validaciones ahora se manejan con los hooks useSlugValidation y useEmailValidation

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newInvitation.clientName || !newInvitation.clientEmail) {
      toast.error('Nombre y email son requeridos')
      return
    }

    // Validar email antes de crear
    if (!emailValidation.isValid) {
      toast.error('El email no es válido o ya está en uso')
      return
    }

    // Validar slug antes de crear
    if (!slugValidation.isValid) {
      toast.error('El slug no está disponible')
      return
    }

    // Auto-generar slug si no se proporciona
    const slug = newInvitation.slug || generateSlug(newInvitation.clientName)

    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newInvitation,
          slug
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Invitación creada exitosamente')
        setIsDialogOpen(false)
        setNewInvitation({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          slug: '',
          expiresInDays: 7
        })
        loadInvitations()
        
        // Mostrar el link generado
        const invitationLink = `${window.location.origin}/invite/${data.code}`
        navigator.clipboard.writeText(invitationLink)
        toast.success('Link copiado al portapapeles')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear invitación')
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      toast.error('Error al crear invitación')
    }
  }

  const copyInvitationLink = async (code: string) => {
    try {
      const link = `${window.location.origin}/invite/${code}`
      await navigator.clipboard.writeText(link)
      setCopiedCode(code)
      toast.success('Link copiado al portapapeles')
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCode(null)
      }, 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Error al copiar el link')
    }
  }

  const deleteInvitation = async (invitationId: string, clientName: string) => {
    setDeletingInvitationId(invitationId)
    try {
      const response = await fetch(`/api/admin/invitations/${invitationId}`, {
        method: 'DELETE',
        cache: 'no-store' // Evitar cache
      })

      if (response.ok) {
        toast.success(`Invitación de ${clientName} eliminada exitosamente`)
        
        // Recargar la lista con cache deshabilitado
        await loadInvitations()
        
        // Forzar recarga de la página después de un breve delay
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al eliminar invitación')
      }
    } catch (error) {
      console.error('Error deleting invitation:', error)
      toast.error('Error al eliminar invitación')
    } finally {
      setDeletingInvitationId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
      USED: { label: 'Usada', variant: 'default' as const, icon: CheckCircle },
      EXPIRED: { label: 'Expirada', variant: 'destructive' as const, icon: XCircle },
      CANCELLED: { label: 'Cancelada', variant: 'outline' as const, icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando invitaciones...</div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      title="Invitaciones" 
      isAdmin={true}
      user={{
        name: session?.user?.name || "Admin",
        email: session?.user?.email || "admin@sistema.com"
      }}
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invitaciones</h1>
          <p className="text-muted-foreground">
            Gestiona las invitaciones para nuevos clientes
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Invitación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Invitación</DialogTitle>
              <DialogDescription>
                Genera un link único para invitar a un nuevo cliente
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente *</Label>
                <Input
                  id="clientName"
                  value={newInvitation.clientName}
                  onChange={(e) => setNewInvitation(prev => ({
                    ...prev,
                    clientName: e.target.value,
                    slug: prev.slug || generateSlug(e.target.value)
                  }))}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email del Cliente *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newInvitation.clientEmail}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="juan@empresa.com"
                  className={emailValidation.isValid ? '' : 'border-red-500 focus:border-red-500'}
                  required
                />
                {emailValidation.message && (
                  <p className={`text-xs ${emailValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {emailValidation.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Teléfono (Opcional)</Label>
                <Input
                  id="clientPhone"
                  value={newInvitation.clientPhone}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="555-1234"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug del Dominio</Label>
                <Input
                  id="slug"
                  value={newInvitation.slug}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="mi-empresa"
                  className={slugValidation.isValid ? '' : 'border-red-500 focus:border-red-500'}
                />
                {slugValidation.message && (
                  <p className={`text-xs ${slugValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {slugValidation.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Se auto-genera basado en el nombre si se deja vacío
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Expira en (días)</Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  min="1"
                  max="30"
                  value={newInvitation.expiresInDays}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Crear Invitación
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invitaciones</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter(i => i.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter(i => i.status === 'USED').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter(i => i.status === 'EXPIRED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Invitaciones</CardTitle>
          <CardDescription>
            Gestiona todas las invitaciones enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay invitaciones</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera invitación para comenzar
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Invitación
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invitation.clientName}</span>
                        </div>
                        {getStatusBadge(invitation.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {invitation.clientEmail}
                        </div>
                        
                        {invitation.clientPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {invitation.clientPhone}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(invitation.createdAt)}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Slug:</span> {invitation.slug}
                        <span className="ml-4 font-medium">Expira:</span> {formatDate(invitation.expiresAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.code)}
                        disabled={invitation.status !== 'PENDING'}
                        className={copiedCode === invitation.code ? 'bg-green-100 text-green-800 border-green-300' : ''}
                      >
                        {copiedCode === invitation.code ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar Link
                          </>
                        )}
                      </Button>
                      
                      {invitation.status === 'USED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/invite/${invitation.code}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      )}

                      {/* Botón de eliminar - Solo para invitaciones no usadas */}
                      {invitation.status !== 'USED' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              disabled={deletingInvitationId === invitation.id}
                            >
                              {deletingInvitationId === invitation.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  Eliminando...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Eliminar Invitación
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que quieres eliminar la invitación de <strong>{invitation.clientName}</strong>?
                                <br /><br />
                                Esta acción eliminará permanentemente:
                                <br />
                                • El link de invitación
                                <br />
                                • Los datos de contacto del cliente
                                <br />
                                • El slug reservado
                                <br /><br />
                                <strong>Esta acción no se puede deshacer.</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteInvitation(invitation.id, invitation.clientName)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar Definitivamente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
