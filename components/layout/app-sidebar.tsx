"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Home, 
  Package, 
  Users, 
  Settings, 
  BarChart3, 
  FileText,
  User,
  Shield,
  ShoppingCart,
  Menu,
  Clock,
  Share2,
  ChevronDown,
  ChevronRight,
  Tag,
  Layers
} from "lucide-react"

const navigation = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Productos",
    icon: Package,
    hasSubmenu: true,
    submenu: [
      {
        name: "Todos los Productos",
        href: "/dashboard/products",
        icon: Menu,
      },
      {
        name: "Categorías",
        href: "/dashboard/categories",
        icon: Tag,
        description: "Organiza tus productos"
      },
      {
        name: "Opciones Globales",
        href: "/dashboard/global-options",
        icon: Layers,
      },
    ],
  },
  {
    name: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    name: "Disponibilidad",
    href: "/dashboard/availability",
    icon: Clock,
  },
  {
    name: "Compartir",
    href: "/dashboard/share",
    icon: Share2,
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

const adminNavigation = [
  {
    name: "Panel Admin",
    href: "/admin",
    icon: Shield,
  },
  {
    name: "Invitaciones",
    href: "/admin/invitations",
    icon: User,
  },
  {
    name: "Clientes",
    href: "/admin/clients",
    icon: Users,
  },
  {
    name: "Configuración Sistema",
    href: "/admin/settings",
    icon: Settings,
  },
]

interface AppSidebarProps {
  isAdmin?: boolean
}

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [storeName, setStoreName] = useState("Mi Empresa")

  const currentNavigation = isAdmin ? adminNavigation : navigation

  // Obtener el nombre de la tienda
  useEffect(() => {
    if (!isAdmin) {
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
  }, [isAdmin])

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  return (
    <div className={cn(
      "flex h-full w-64 flex-col border-r bg-background transition-all duration-300",
      collapsed && "w-16"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-primary" />
          {!collapsed && (
            <span className="text-lg font-semibold">{storeName}</span>
          )}
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-4">
          {currentNavigation.map((item) => {
            const isActive = pathname === item.href
            const hasSubmenu = 'hasSubmenu' in item && item.hasSubmenu
            const isExpanded = expandedMenus.includes(item.name)
            
            if (hasSubmenu && item.submenu) {
              return (
                <div key={item.name}>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSubmenu(item.name)}
                    className={cn(
                      "w-full justify-start",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && (
                      <>
                        <span className="ml-2">{item.name}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 ml-auto" />
                        ) : (
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        )}
                      </>
                    )}
                  </Button>
                  
                  {!collapsed && isExpanded && (
                    <div className="ml-6 space-y-1 mt-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link key={subItem.name} href={subItem.href}>
                            <Button
                              variant={isSubActive ? "secondary" : "ghost"}
                              className="w-full justify-start text-sm"
                            >
                              <subItem.icon className="h-4 w-4" />
                              <span className="ml-2">{subItem.name}</span>
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }
            
            return (
              <Link key={item.name} href={item.href || '#'}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Collapse Button */}
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full"
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Colapsar</span>}
        </Button>
      </div>
    </div>
  )
}
