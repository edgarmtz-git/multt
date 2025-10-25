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
      unifiedSchedule: true,
      enableBusinessHours: true,
      serviceHours: true
    }
  })

  // Configuración por defecto si no existe - TODOS CERRADOS hasta que el usuario configure
  const defaultSchedule = {
    operatingHours: {
      monday: { isOpen: false, periods: [{ open: "09:00", close: "22:00" }] },
      tuesday: { isOpen: false, periods: [{ open: "09:00", close: "22:00" }] },
      wednesday: { isOpen: false, periods: [{ open: "09:00", close: "22:00" }] },
      thursday: { isOpen: false, periods: [{ open: "09:00", close: "22:00" }] },
      friday: { isOpen: false, periods: [{ open: "09:00", close: "23:00" }] },
      saturday: { isOpen: false, periods: [{ open: "10:00", close: "23:00" }] },
      sunday: { isOpen: false, periods: [{ open: "11:00", close: "21:00" }] }
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
  
  // Si los horarios comerciales están habilitados, usar la configuración de la BD
  if (storeSettings?.enableBusinessHours && storeSettings?.unifiedSchedule) {
    try {
      unifiedSchedule = typeof storeSettings.unifiedSchedule === 'string' 
        ? JSON.parse(storeSettings.unifiedSchedule) 
        : storeSettings.unifiedSchedule
    } catch (error) {
      console.error('Error parsing unifiedSchedule:', error)
      unifiedSchedule = defaultSchedule
    }
  } else if (storeSettings?.enableBusinessHours && storeSettings?.serviceHours) {
    // Si no hay unifiedSchedule pero sí serviceHours, convertir el formato
    try {
      const serviceHours = typeof storeSettings.serviceHours === 'string' 
        ? JSON.parse(storeSettings.serviceHours) 
        : storeSettings.serviceHours
      
      // Convertir serviceHours al formato unifiedSchedule
      unifiedSchedule = {
        operatingHours: {
          monday: { isOpen: serviceHours.monday?.isOpen || false, periods: [{ open: serviceHours.monday?.openTime || "09:00", close: serviceHours.monday?.closeTime || "22:00" }] },
          tuesday: { isOpen: serviceHours.tuesday?.isOpen || false, periods: [{ open: serviceHours.tuesday?.openTime || "09:00", close: serviceHours.tuesday?.closeTime || "22:00" }] },
          wednesday: { isOpen: serviceHours.wednesday?.isOpen || false, periods: [{ open: serviceHours.wednesday?.openTime || "09:00", close: serviceHours.wednesday?.closeTime || "22:00" }] },
          thursday: { isOpen: serviceHours.thursday?.isOpen || false, periods: [{ open: serviceHours.thursday?.openTime || "09:00", close: serviceHours.thursday?.closeTime || "22:00" }] },
          friday: { isOpen: serviceHours.friday?.isOpen || false, periods: [{ open: serviceHours.friday?.openTime || "09:00", close: serviceHours.friday?.closeTime || "22:00" }] },
          saturday: { isOpen: serviceHours.saturday?.isOpen || false, periods: [{ open: serviceHours.saturday?.openTime || "10:00", close: serviceHours.saturday?.closeTime || "22:00" }] },
          sunday: { isOpen: serviceHours.sunday?.isOpen || false, periods: [{ open: serviceHours.sunday?.openTime || "11:00", close: serviceHours.sunday?.closeTime || "21:00" }] }
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
    } catch (error) {
      console.error('Error parsing serviceHours:', error)
      unifiedSchedule = defaultSchedule
    }
  }

  return (
    <DashboardLayout
      user={{
        name: session.user.name || "Usuario",
        email: session.user.email || "",
        avatar: session.user.avatar || undefined,
        company: storeSettings?.storeSlug
      }}
    >
      <AvailabilityPageClient initialSchedule={unifiedSchedule} />
    </DashboardLayout>
  )
}