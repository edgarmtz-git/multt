import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Share2, 
  Copy, 
  ExternalLink,
  QrCode,
  Link,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Mail,
  CheckCircle
} from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function SharePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id || session.user?.role !== 'CLIENT') {
    redirect('/login')
  }

  // Obtener información del usuario actual
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      company: true,
      name: true
    }
  })

  // Obtener el slug de la tienda desde la configuración
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { userId: session.user.id },
    select: { storeSlug: true }
  })
  
  const storeUrl = storeSettings?.storeSlug ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/tienda/${storeSettings.storeSlug}` : ''
  const businessName = user?.name || "Tu Negocio"

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Compartir tu Menú Digital</h2>
              <p className="text-muted-foreground">
                Comparte tu menú digital con tus clientes y haz crecer tu negocio
              </p>
            </div>
          </div>

        {/* Main Share Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Enlace de tu Menú Digital
            </CardTitle>
            <CardDescription>
              Este es el enlace directo a tu menú digital que puedes compartir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input 
                value={storeUrl} 
                readOnly 
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Tu menú está activo y disponible para tus clientes</span>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Código QR
            </CardTitle>
            <CardDescription>
              Genera un código QR para que tus clientes accedan fácilmente a tu menú
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground">Código QR de tu menú</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Generar QR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Compartir en Redes Sociales
            </CardTitle>
            <CardDescription>
              Comparte tu menú digital en tus redes sociales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <Facebook className="h-6 w-6 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <Twitter className="h-6 w-6 text-blue-400" />
                <span className="text-sm">Twitter</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <Instagram className="h-6 w-6 text-pink-600" />
                <span className="text-sm">Instagram</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <MessageCircle className="h-6 w-6 text-green-600" />
                <span className="text-sm">WhatsApp</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Compartir por Email
            </CardTitle>
            <CardDescription>
              Envía el enlace de tu menú por correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email del destinatario</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="cliente@ejemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje personalizado (opcional)</Label>
              <textarea 
                id="message"
                className="w-full p-3 border border-input rounded-md resize-none"
                rows={4}
                placeholder={`¡Hola! Te invito a ver el menú digital de ${businessName}. Puedes ver todos nuestros productos y hacer pedidos directamente desde aquí: ${storeUrl}`}
              />
            </div>
            
            <Button className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
          </CardContent>
        </Card>

        {/* Sharing Tips */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Consejos para Compartir</CardTitle>
            <CardDescription>
              Ideas para promocionar tu menú digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">📱 En tu Local</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Coloca el código QR en las mesas</li>
                  <li>• Incluye el enlace en tu carta física</li>
                  <li>• Muestra el menú digital en pantallas</li>
                  <li>• Capacita a tu personal para compartirlo</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">🌐 En Línea</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Comparte en tus redes sociales</li>
                  <li>• Incluye el enlace en tu sitio web</li>
                  <li>• Envía por WhatsApp a tus clientes</li>
                  <li>• Úsalo en campañas de marketing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
