"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, User, LogOut, Settings, ExternalLink, Store } from "lucide-react"
import { signOut } from "next-auth/react"

interface DashboardHeaderProps {
  user?: {
    name: string
    email: string
    avatar?: string
    company?: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [storeName, setStoreName] = useState("")

  // Obtener el nombre de la tienda
  useEffect(() => {
    if (user?.company) {
      fetch('/api/dashboard/settings')
        .then(res => res.json())
        .then(data => {
          if (data.storeName) {
            setStoreName(data.storeName)
          }
        })
        .catch(() => {
          // Mantener el valor por defecto si hay error
        })
    }
  }, [user?.company])
  const handleSignOut = async () => {
    // Usar la URL base actual del navegador para evitar conflictos de puerto
    const currentOrigin = window.location.origin
    await signOut({ callbackUrl: `${currentOrigin}/` })
  }

  const openDigitalMenu = () => {
    if (user?.company) {
      // Obtener el slug de la tienda desde la configuración
      fetch('/api/dashboard/settings')
        .then(res => res.json())
        .then(data => {
          if (data.storeSlug) {
            const storeUrl = `${window.location.origin}/tienda/${data.storeSlug}`
            window.open(storeUrl, '_blank', 'noopener,noreferrer')
          }
        })
        .catch(() => {
          // Fallback: usar el company si no se puede obtener el slug
          const storeUrl = `${window.location.origin}/tienda/${user.company}`
          window.open(storeUrl, '_blank', 'noopener,noreferrer')
        })
    }
  }

  return (
    <header className="flex h-16 items-center justify-end border-b bg-background px-6">
      {/* Actions */}
      <div className="flex items-center space-x-4">

        {/* Digital Menu Button - Only show for clients */}
        {user?.company && (
          <Button onClick={openDigitalMenu} variant="outline" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>{storeName ? `Menú ${storeName}` : 'Menú Digital'}</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "Usuario"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "usuario@ejemplo.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
