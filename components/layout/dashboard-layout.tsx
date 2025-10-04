"use client"

import { ReactNode } from "react"
import { AppSidebar } from "./app-sidebar"
import { DashboardHeader } from "./dashboard-header"

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  isAdmin?: boolean
  user?: {
    name: string
    email: string
    avatar?: string
    company?: string
  }
}

export function DashboardLayout({ 
  children, 
  title, 
  isAdmin = false,
  user
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar isAdmin={isAdmin} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader user={user} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
