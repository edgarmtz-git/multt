"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Calendar } from "lucide-react"
import { toast } from "sonner"

interface InvitationData {
  id: string
  code: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  slug: string
  status: string
  expiresAt: string
  createdAt: string
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (code) {
      loadInvitation()
    }
  }, [code])

  const loadInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${code}`)
      const data = await response.json()

      if (response.ok) {
        setInvitation(data)
        
        // Verificar si la invitación ha expirado
        const now = new Date()
        const expiresAt = new Date(data.expiresAt)
        
        if (now > expiresAt && data.status === 'PENDING') {
          setError('Esta invitación ha expirado')
        } else if (data.status === 'USED') {
          setError('Esta invitación ya ha sido utilizada')
        } else if (data.status === 'CANCELLED') {
          setError('Esta invitación ha sido cancelada')
        }
      } else {
        setError(data.message || 'Invitación no encontrada')
      }
    } catch (error) {
      console.error('Error loading invitation:', error)
      setError('Error al cargar la invitación')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/invitations/${code}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('¡Cuenta creada exitosamente!')
        // Redirigir al login con mensaje de éxito
        router.push(`/login?message=account-created&email=${encodeURIComponent(invitation?.clientEmail || '')}`)
      } else {
        setError(data.message || 'Error al crear la cuenta')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      setError('Error al crear la cuenta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'USED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'EXPIRED':
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente'
      case 'USED':
        return 'Usada'
      case 'EXPIRED':
        return 'Expirada'
      case 'CANCELLED':
        return 'Cancelada'
      default:
        return 'Desconocido'
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Cargando invitación...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-xl text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} variant="outline">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Invitación no encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">¡Bienvenido!</CardTitle>
          <CardDescription>
            Tu cuenta está lista para ser activada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información del cliente */}
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h3 className="font-medium text-center mb-3">Información de tu cuenta</h3>
            
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{invitation.clientName}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{invitation.clientEmail}</span>
            </div>
            
            {invitation.clientPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{invitation.clientPhone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Dominio: {invitation.slug}.tudominio.com</span>
            </div>
          </div>

          {/* Estado de la invitación */}
          <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
            {getStatusIcon(invitation.status)}
            <span className="font-medium">Estado: {getStatusText(invitation.status)}</span>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Formulario de activación */}
          {invitation.status === 'PENDING' && !error && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando cuenta...' : 'Activar Mi Cuenta'}
              </Button>
            </form>
          )}

          {/* Información adicional */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Fecha de expiración: {formatDate(invitation.expiresAt)}</p>
            <p>Una vez activada, podrás acceder a tu dashboard personalizado</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
