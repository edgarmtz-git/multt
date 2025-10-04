import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Check, 
  Star, 
  Users, 
  Package, 
  Zap,
  Shield,
  Headphones
} from "lucide-react"

export default function HomePage() {
  // Productos/servicios destacados
  const featuredProducts = [
    {
      id: 1,
      name: "Plan Básico",
      price: "$29/mes",
      description: "Perfecto para pequeñas empresas que están comenzando",
      features: [
        "Hasta 100 productos",
        "Dashboard básico",
        "Soporte por email",
        "Reportes mensuales"
      ],
      popular: false
    },
    {
      id: 2,
      name: "Plan Profesional",
      price: "$79/mes",
      description: "Ideal para empresas en crecimiento",
      features: [
        "Productos ilimitados",
        "Dashboard avanzado",
        "Soporte prioritario",
        "Reportes en tiempo real",
        "API personalizada",
        "Integraciones"
      ],
      popular: true
    },
    {
      id: 3,
      name: "Plan Empresarial",
      price: "$199/mes",
      description: "Para grandes empresas con necesidades complejas",
      features: [
        "Todo del plan Profesional",
        "Multi-tenant",
        "Soporte 24/7",
        "Customización completa",
        "SLA garantizado",
        "Gerente de cuenta dedicado"
      ],
      popular: false
    }
  ]

  const features = [
    {
      icon: Package,
      title: "Gestión de Productos",
      description: "Administra tu catálogo de productos de manera eficiente"
    },
    {
      icon: Users,
      title: "Gestión de Clientes",
      description: "Mantén un registro completo de tus clientes"
    },
    {
      icon: Zap,
      title: "Dashboard en Tiempo Real",
      description: "Monitorea tu negocio con datos actualizados al instante"
    },
    {
      icon: Shield,
      title: "Seguridad Avanzada",
      description: "Tus datos están protegidos con la mejor tecnología"
    },
    {
      icon: Headphones,
      title: "Soporte 24/7",
      description: "Nuestro equipo está disponible cuando lo necesites"
    }
  ]

  const stats = [
    { number: "10,000+", label: "Usuarios Activos" },
    { number: "99.9%", label: "Tiempo de Actividad" },
    { number: "24/7", label: "Soporte Disponible" },
    { number: "50+", label: "Integraciones" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded" />
            <span className="text-xl font-bold">MiEmpresa</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm hover:text-primary">Características</Link>
            <Link href="#pricing" className="text-sm hover:text-primary">Precios</Link>
            <Link href="#contact" className="text-sm hover:text-primary">Contacto</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Gestiona tu negocio con{" "}
            <span className="text-primary">facilidad</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La plataforma todo-en-uno para administrar productos, clientes y ventas. 
            Diseñada para empresas de todos los tamaños.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
          
          {/* Tiendas de ejemplo */}
          <div className="mt-12">
            <p className="text-sm text-muted-foreground mb-4">Visita nuestras tiendas de ejemplo:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tienda/tech-corp">
                <Button variant="outline" size="sm">
                  🖥️ Tech Corp
                </Button>
              </Link>
              <Link href="/tienda/design-studio">
                <Button variant="outline" size="sm">
                  🎨 Design Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas para tu negocio</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nuestra plataforma incluye todas las herramientas necesarias para gestionar 
              tu empresa de manera eficiente y profesional.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planes para cada necesidad</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu empresa. Puedes cambiar o cancelar en cualquier momento.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProducts.map((product) => (
              <Card key={product.id} className={`relative ${product.popular ? 'border-primary shadow-lg' : ''}`}>
                {product.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary">Más Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-center">{product.name}</CardTitle>
                  <div className="text-center">
                    <span className="text-4xl font-bold">{product.price}</span>
                  </div>
                  <CardDescription className="text-center">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={product.popular ? "default" : "outline"}>
                    Seleccionar Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded" />
                <span className="font-bold">MiEmpresa</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma líder para gestión empresarial.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Características</Link></li>
                <li><Link href="#" className="hover:text-primary">Precios</Link></li>
                <li><Link href="#" className="hover:text-primary">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Centro de Ayuda</Link></li>
                <li><Link href="#" className="hover:text-primary">Contacto</Link></li>
                <li><Link href="#" className="hover:text-primary">Estado del Sistema</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-primary">Términos</Link></li>
                <li><Link href="#" className="hover:text-primary">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 MiEmpresa. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}