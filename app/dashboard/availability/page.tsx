import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AvailabilityPageClient } from "./client"

export default async function AvailabilityPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id || session.user?.role !== 'CLIENT') {
    redirect('/login')
  }

  // Obtener configuración unificada de horarios
  const storeSettings = await prisma.storeSettings.findFirst({
    where: { userId: session.user.id },
    select: {
      storeName: true,
      storeSlug: true,
      unifiedSchedule: true
    }
  })

  // Configuración por defecto si no existe
  const defaultSchedule = {
    operatingHours: {
      monday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
      tuesday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
      wednesday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
      thursday: { isOpen: true, periods: [{ open: "09:00", close: "22:00" }] },
      friday: { isOpen: true, periods: [{ open: "09:00", close: "23:00" }] },
      saturday: { isOpen: true, periods: [{ open: "10:00", close: "23:00" }] },
      sunday: { isOpen: true, periods: [{ open: "11:00", close: "21:00" }] }
    },
    deliveryOptions: {
      enabled: true,
      immediate: true,
      scheduled: true,
      pickup: true,
      minAdvanceHours: 1,
      maxAdvanceDays: 7,
      useOperatingHours: true
    },
    exceptions: []
  }

  // Parsear unifiedSchedule si es string, o usar defaultSchedule si no existe
  let unifiedSchedule = defaultSchedule
  if (storeSettings?.unifiedSchedule) {
    try {
      unifiedSchedule = typeof storeSettings.unifiedSchedule === 'string' 
        ? JSON.parse(storeSettings.unifiedSchedule) 
        : storeSettings.unifiedSchedule
    } catch (error) {
      console.error('Error parsing unifiedSchedule:', error)
      unifiedSchedule = defaultSchedule
    }
  }

  return (
    <DashboardLayout 
      user={{
        name: session.user.name || "Usuario",
        email: session.user.email || "",
        avatar: session.user.avatar,
        company: storeSettings?.storeSlug
      }}
    >
      <AvailabilityPageClient initialSchedule={unifiedSchedule} />
    </DashboardLayout>
  )
}