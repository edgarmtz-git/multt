/**
 * Helper para obtener el slug correcto de un usuario
 *
 * NOTA: Este helper funciona como SAFETY NET. En el flujo normal de invitaciones,
 * el StoreSettings siempre se crea en la transacción de aceptación (accept/route.ts).
 * Sin embargo, este helper es necesario para:
 * - Recuperación de fallos parciales de transacción
 * - Migraciones de datos históricos
 * - Usuarios creados manualmente (casos excepcionales)
 *
 * Prioridad de resolución:
 * 1. Si ya tiene StoreSettings, usar ese slug (caso normal)
 * 2. Si tiene invitación USED, usar el slug de la invitación (recuperación)
 * 3. Generar slug basado en el email del usuario (fallback absoluto)
 */

import { prisma } from '@/lib/prisma'

export async function getUserSlug(userId: string, userEmail: string): Promise<string> {
  // 1. Verificar si ya tiene StoreSettings
  const existingSettings = await prisma.storeSettings.findUnique({
    where: { userId },
    select: { storeSlug: true }
  })

  if (existingSettings) {
    return existingSettings.storeSlug
  }

  // 2. Buscar invitación usada por este usuario
  const invitation = await prisma.invitation.findFirst({
    where: {
      clientEmail: userEmail,
      status: 'USED'
    },
    select: { slug: true },
    orderBy: { createdAt: 'desc' } // Más reciente
  })

  if (invitation?.slug) {
    // Verificar que el slug de la invitación no esté en uso
    const slugInUse = await prisma.storeSettings.findFirst({
      where: { storeSlug: invitation.slug }
    })

    if (!slugInUse) {
      return invitation.slug
    }
  }

  // 3. Generar slug desde el email (fallback)
  const emailPrefix = userEmail.split('@')[0]
  const cleanSlug = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  // Asegurar unicidad añadiendo timestamp
  const baseSlug = cleanSlug || 'tienda'
  let finalSlug = baseSlug
  let counter = 1

  // Verificar unicidad
  while (true) {
    const existing = await prisma.storeSettings.findFirst({
      where: { storeSlug: finalSlug }
    })

    if (!existing) break

    finalSlug = `${baseSlug}-${counter}`
    counter++
  }

  return finalSlug
}
