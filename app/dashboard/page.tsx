import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp,
  ShoppingCart,
  Eye,
  AlertTriangle,
  Phone
} from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id || session.user?.role !== 'CLIENT') {
    redirect('/login')
  }

  // Obtener información del usuario actual
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isSuspended: true,
      suspensionReason: true,
      suspendedAt: true,
      company: true
    }
  })

  // Si está suspendido, mostrar mensaje de suspensión
  if (user?.isSuspended) {
    return (
      <DashboardLayout 
        title="Dashboard" 
        user={{
          name: session.user.name || "Usuario",
          email: session.user.email || "",
          avatar: session.user.avatar || undefined,
          company: user?.company || undefined
        }}
      >
        <div className="space-y-6">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <p className="font-semibold">Cuenta Suspendida Temporalmente</p>
                <p>{user.suspensionReason || "Su cuenta ha sido suspendida por pago pendiente."}</p>
                <p className="text-sm">
                  Para reactivar su cuenta, contacte con soporte o complete el pago pendiente.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">Contacto: admin@sistema.com</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }
  // Datos simulados del usuario
  const stats = [
    {
      title: "Ingresos Totales",
      value: "$45,231.89",
      change: "+20.1%",
      icon: DollarSign,
      description: "desde el mes pasado"
    },
    {
      title: "Productos",
      value: "156",
      change: "+12",
      icon: Package,
      description: "productos activos"
    },
    {
      title: "Clientes",
      value: "2,350",
      change: "+180",
      icon: Users,
      description: "clientes registrados"
    },
    {
      title: "Ventas",
      value: "12,234",
      change: "+19%",
      icon: TrendingUp,
      description: "este mes"
    }
  ]

  const recentActivities = [
    { id: 1, action: "Nuevo producto agregado", time: "hace 2 horas", type: "product" },
    { id: 2, action: "Venta completada - $299.99", time: "hace 4 horas", type: "sale" },
    { id: 3, action: "Cliente registrado", time: "hace 6 horas", type: "user" },
    { id: 4, action: "Inventario actualizado", time: "hace 8 horas", type: "inventory" },
    { id: 5, action: "Reporte generado", time: "hace 1 día", type: "report" }
  ]

  return (
    <DashboardLayout 
      user={{
        name: session.user.name || "Usuario",
        email: session.user.email || "",
        avatar: session.user.avatar || undefined,
        company: user?.company || undefined
      }}
    >
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Resumen de tu tienda</p>
          </div>
        </div>
        
        <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
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
                  <span className="text-green-600">{stat.change}</span> {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="activities">Actividades Recientes</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Resumen de Ventas</CardTitle>
                  <CardDescription>
                    Rendimiento de ventas de los últimos 30 días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Gráfico de ventas (implementar con recharts)
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Productos Destacados</CardTitle>
                  <CardDescription>
                    Tus productos más vendidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Producto A</p>
                        <p className="text-xs text-muted-foreground">45 ventas</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Producto B</p>
                        <p className="text-xs text-muted-foreground">32 ventas</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Producto C</p>
                        <p className="text-xs text-muted-foreground">28 ventas</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actividades Recientes</CardTitle>
                <CardDescription>
                  Últimas acciones en tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Mis Productos</h3>
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Lista de Productos</CardTitle>
                <CardDescription>
                  Gestiona todos tus productos y servicios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Lista de productos (implementar tabla con datos)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
