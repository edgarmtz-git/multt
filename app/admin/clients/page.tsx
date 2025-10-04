"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Trash2,
  Eye,
  Calendar,
  Mail,
  Phone,
  Building,
  AlertTriangle,
  Pause,
  Play
} from "lucide-react"
import { toast } from "sonner"
import { ClientDetailsModal } from "@/components/modals/client-details-modal"

interface Client {
  id: string
  email: string
  name: string
  company: string
  role: string
  isActive: boolean
  isSuspended?: boolean
  suspensionReason?: string
  suspendedAt?: string
  createdAt: string
  updatedAt: string
  // Datos de invitación si existe
  invitation?: {
    id: string
    serviceStart: string
    serviceRenewal: string
    status: string
  }
}

export default function AdminClientsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Verificar que sea admin
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Cargar clientes
  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      loadClients()
    }
  }, [session])

  const loadClients = async () => {
    try {
      const response = await fetch('/api/admin/clients', {
        credentials: 'include' // Incluir cookies de autenticación
      })
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
        credentials: 'include' // Incluir cookies de autenticación
      })

      if (response.ok) {
        toast.success(`Cliente ${clientName} eliminado completamente`)
        loadClients()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al eliminar cliente')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Error al eliminar cliente')
    }
  }

  const handleSuspendClient = async (clientId: string, clientName: string) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Incluir cookies de autenticación
        body: JSON.stringify({
          reason: process.env.DEFAULT_SUSPENSION_REASON || 'Pago pendiente - renovación vencida'
        })
      })

      if (response.ok) {
        toast.success(`Cliente ${clientName} suspendido`)
        loadClients()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al suspender cliente')
      }
    } catch (error) {
      console.error('Error suspending client:', error)
      toast.error('Error al suspender cliente')
    }
  }

  const handleActivateClient = async (clientId: string, clientName: string) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/activate`, {
        method: 'POST',
        credentials: 'include' // Incluir cookies de autenticación
      })

      if (response.ok) {
        toast.success(`Cliente ${clientName} activado`)
        loadClients()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al activar cliente')
      }
    } catch (error) {
      console.error('Error activating client:', error)
      toast.error('Error al activar cliente')
    }
  }

  const getStatusBadge = (client: Client) => {
    if (client.isSuspended) {
      return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Suspendido</Badge>
    }
    
    if (!client.isActive) {
      return <Badge variant="destructive">Inactivo</Badge>
    }
    
    if (client.invitation) {
      switch (client.invitation.status) {
        case 'USED':
          return <Badge variant="default">Activo</Badge>
        case 'PENDING':
          return <Badge variant="secondary">Pendiente</Badge>
        case 'EXPIRED':
          return <Badge variant="destructive">Expirado</Badge>
        case 'CANCELLED':
          return <Badge variant="outline">Cancelado</Badge>
        default:
          return <Badge variant="default">Activo</Badge>
      }
    }
    
    return <Badge variant="default">Activo</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <DashboardLayout 
        title="Gestión de Clientes" 
        isAdmin={true}
        user={{
          name: session?.user?.name || "Admin",
          email: session?.user?.email || "admin@sistema.com"
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando clientes...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Gestión de Clientes" 
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
            <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
            <p className="text-muted-foreground">
              Administra todos los clientes del sistema
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.isActive).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.invitation?.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => !c.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Clientes</CardTitle>
            <CardDescription>
              Busca por nombre, email o empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              Gestiona todos los clientes registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? 'No se encontraron clientes' : 'No hay clientes'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los clientes aparecerán aquí cuando se registren'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-medium text-lg">
                            {client.name?.charAt(0) || client.email.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg">
                                {client.name || 'Sin nombre'}
                              </h3>
                              {getStatusBadge(client)}
                            </div>
                            
                            {/* Solo mostrar renovación */}
                            {client.invitation?.serviceRenewal && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Renovación:</span> {formatDate(client.invitation.serviceRenewal)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClientId(client.id)
                            setIsModalOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        
                        {/* Botón de suspensión/activación */}
                        {client.isSuspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateClient(client.id, client.name || client.email)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Activar
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendClient(client.id, client.name || client.email)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Suspender
                          </Button>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Eliminar Cliente Completamente
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará <strong>PERMANENTEMENTE</strong>:
                                <br />
                                • La cuenta del usuario
                                <br />
                                • Su dashboard y datos
                                <br />
                                • Todos los productos y pedidos
                                <br />
                                • La invitación asociada
                                <br />
                                <br />
                                <strong className="text-red-600">Esta acción NO se puede deshacer.</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteClient(client.id, client.name || client.email)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar Definitivamente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de detalles del cliente */}
        <ClientDetailsModal
          clientId={selectedClientId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedClientId(null)
          }}
        />
      </div>
    </DashboardLayout>
  )
}
