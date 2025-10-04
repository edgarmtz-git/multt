"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Building2, 
  Activity, 
  Shield,
  UserPlus,
  Settings,
  Eye,
  MoreHorizontal
} from "lucide-react"

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalCompanies: number
  activeCompanies: number
}

interface RecentUser {
  id: string
  name: string
  email: string
  company: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCompanies: 0,
    activeCompanies: 0
  })
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemData()
  }, [])

  const fetchSystemData = async () => {
    try {
      setLoading(true)
      
      // Obtener estadísticas del sistema
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setSystemStats(stats)
      }

      // Obtener usuarios recientes
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const users = await usersResponse.json()
        setRecentUsers(users.slice(0, 5)) // Solo los 5 más recientes
      }
    } catch (error) {
      console.error('Error fetching system data:', error)
    } finally {
      setLoading(false)
    }
  }
  // Estadísticas dinámicas del sistema
  const statsCards = [
    {
      title: "Usuarios Totales",
      value: systemStats.totalUsers.toString(),
      icon: Users,
      description: "usuarios registrados"
    },
    {
      title: "Usuarios Activos",
      value: systemStats.activeUsers.toString(),
      icon: Users,
      description: "usuarios activos"
    },
    {
      title: "Empresas Totales",
      value: systemStats.totalCompanies.toString(),
      icon: Building2,
      description: "empresas registradas"
    },
    {
      title: "Empresas Activas",
      value: systemStats.activeCompanies.toString(),
      icon: Building2,
      description: "empresas activas"
    }
  ]

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-red-500"
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Activo" : "Inactivo"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "hace menos de 1 hora"
    if (diffInHours < 24) return `hace ${diffInHours} horas`
    const diffInDays = Math.floor(diffInHours / 24)
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <DashboardLayout 
        title="Panel de Administración" 
        isAdmin={true}
        user={{
          name: session?.user?.name || "Admin",
          email: session?.user?.email || "admin@sistema.com"
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando datos del sistema...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Panel de Administración" 
      isAdmin={true}
      user={{
        name: "Admin",
        email: "admin@sistema.com"
      }}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Usuarios Recientes</CardTitle>
                <CardDescription>
                  Lista de usuarios registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay usuarios registrados</p>
                    </div>
                  ) : (
                    recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.company || 'Sin empresa'} • {user.role}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Registrado {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(user.isActive)}`} />
                            <span className="text-sm">{getStatusText(user.isActive)}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Empresas Registradas</CardTitle>
                <CardDescription>
                  Gestión de empresas y sus configuraciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Lista de empresas (implementar tabla con datos)
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>
                    Ajustes generales del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Registro de usuarios</span>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notificaciones por email</span>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup automático</span>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logs del Sistema</CardTitle>
                  <CardDescription>
                    Registro de actividades del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">Usuario admin inició sesión - hace 5 minutos</div>
                    <div className="text-sm">Nuevo usuario registrado - hace 10 minutos</div>
                    <div className="text-sm">Backup completado - hace 1 hora</div>
                    <div className="text-sm">Sistema reiniciado - hace 2 horas</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}