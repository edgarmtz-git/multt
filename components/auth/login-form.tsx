"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginFormProps {
  error?: string
}

export function LoginForm({ error: urlError }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  // Mostrar error de URL si existe
  useEffect(() => {
    if (urlError) {
      switch (urlError) {
        case 'session_invalid':
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
          break
        case 'account_disabled':
          setError('Tu cuenta ha sido desactivada o suspendida.')
          break
        case 'session_error':
          setError('Error de sesión. Por favor, inicia sesión nuevamente.')
          break
        default:
          setError('Ha ocurrido un error. Por favor, intenta nuevamente.')
      }
    }
  }, [urlError])

  // Verificar si ya está autenticado al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession()
        
        if (session?.user) {
          // Usuario ya está autenticado, redirigir según su rol
          if (session.user.role === 'ADMIN') {
            router.push("/admin")
          } else if (session.user.role === 'CLIENT') {
            router.push("/dashboard")
          }
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Usar NextAuth para autenticación real
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciales incorrectas. Verifica tu email y contraseña.")
        return
      }

      // Obtener la sesión para determinar el rol
      const session = await getSession()
      
      if (session?.user) {
        // Redirigir según el rol del usuario
        if (session.user.role === 'ADMIN') {
          router.push("/admin")
        } else if (session.user.role === 'CLIENT') {
          router.push("/dashboard")
        } else {
          setError("Rol de usuario no válido.")
        }
      }
    } catch (error) {
      console.error("Error de autenticación:", error)
      setError("Error interno del servidor. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading mientras verifica autenticación
  if (isCheckingAuth) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Verificando autenticación...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tu email y contraseña para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-primary hover:underline">
              Regístrate aquí
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
