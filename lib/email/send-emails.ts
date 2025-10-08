// Funciones helper para enviar cada tipo de email

import { sendEmail, emailConfig } from './index'
import { InvitationNewClientEmail } from './templates/invitation-new-client'
import { InvitationAcceptedClientEmail } from './templates/invitation-accepted-client'
import { InvitationAcceptedAdminEmail } from './templates/invitation-accepted-admin'
import { ClientSuspendedEmail } from './templates/client-suspended'
import { ClientSuspendedAdminEmail } from './templates/client-suspended-admin'
import { ClientReactivatedEmail } from './templates/client-reactivated'
import { RenewalReminderEmail } from './templates/renewal-reminder'

// 1. Enviar invitación a nuevo cliente
export async function sendInvitationEmail(data: {
  clientName: string
  clientEmail: string
  invitationCode: string
  slug: string
  expiresAt: Date
}) {
  return sendEmail({
    to: data.clientEmail,
    subject: `Bienvenido a ${emailConfig.companyName} - Tu invitación está lista`,
    react: InvitationNewClientEmail({
      ...data,
      appUrl: emailConfig.appUrl,
      companyName: emailConfig.companyName
    })
  })
}

// 2. Enviar confirmación de aceptación al cliente
export async function sendInvitationAcceptedClientEmail(data: {
  clientName: string
  clientEmail: string
  storeName: string
  storeSlug: string
}) {
  const dashboardUrl = `${emailConfig.appUrl}/dashboard`
  const storeUrl = `${emailConfig.appUrl}/tienda/${data.storeSlug}`

  return sendEmail({
    to: data.clientEmail,
    subject: `¡Bienvenido a ${emailConfig.companyName}! Tu cuenta está activa`,
    react: InvitationAcceptedClientEmail({
      clientName: data.clientName,
      storeName: data.storeName,
      storeSlug: data.storeSlug,
      dashboardUrl,
      storeUrl,
      companyName: emailConfig.companyName
    })
  })
}

// 3. Notificar al admin sobre nueva aceptación
export async function sendInvitationAcceptedAdminEmail(data: {
  clientName: string
  clientEmail: string
  storeName: string
  storeSlug: string
  activatedAt: Date
  renewalDate: Date
}) {
  const adminDashboardUrl = `${emailConfig.appUrl}/admin/clients`

  return sendEmail({
    to: emailConfig.adminEmail,
    subject: `Nueva activación: ${data.clientName}`,
    react: InvitationAcceptedAdminEmail({
      ...data,
      adminDashboardUrl,
      companyName: emailConfig.companyName
    })
  })
}

// 4. Notificar al cliente sobre suspensión
export async function sendClientSuspendedEmail(data: {
  clientName: string
  clientEmail: string
  storeName: string
  suspensionReason: string
  suspendedAt: Date
}) {
  return sendEmail({
    to: data.clientEmail,
    subject: `Tu cuenta en ${emailConfig.companyName} ha sido suspendida`,
    react: ClientSuspendedEmail({
      clientName: data.clientName,
      storeName: data.storeName,
      suspensionReason: data.suspensionReason,
      suspendedAt: data.suspendedAt,
      supportEmail: emailConfig.supportEmail,
      companyName: emailConfig.companyName
    })
  })
}

// 5. Notificar al admin sobre suspensión
export async function sendClientSuspendedAdminEmail(data: {
  clientName: string
  clientEmail: string
  storeName: string
  storeSlug: string
  suspensionReason: string
  suspendedAt: Date
  suspendedBy: string
}) {
  return sendEmail({
    to: emailConfig.adminEmail,
    subject: `Cliente suspendido: ${data.clientName}`,
    react: ClientSuspendedAdminEmail({
      ...data,
      companyName: emailConfig.companyName
    })
  })
}

// 6. Notificar al cliente sobre reactivación
export async function sendClientReactivatedEmail(data: {
  clientName: string
  clientEmail: string
  storeName: string
  storeSlug: string
  reactivatedAt: Date
}) {
  const dashboardUrl = `${emailConfig.appUrl}/dashboard`
  const storeUrl = `${emailConfig.appUrl}/tienda/${data.storeSlug}`

  return sendEmail({
    to: data.clientEmail,
    subject: `¡Tu cuenta en ${emailConfig.companyName} ha sido reactivada!`,
    react: ClientReactivatedEmail({
      clientName: data.clientName,
      storeName: data.storeName,
      storeSlug: data.storeSlug,
      reactivatedAt: data.reactivatedAt,
      dashboardUrl,
      storeUrl,
      companyName: emailConfig.companyName
    })
  })
}

// 7. Enviar recordatorio de renovación
export async function sendRenewalReminderEmail(data: {
  clientName: string
  clientEmail: string
  storeName: string
  renewalDate: Date
  daysUntilRenewal: number
}) {
  const dashboardUrl = `${emailConfig.appUrl}/dashboard`

  return sendEmail({
    to: data.clientEmail,
    subject: `Recordatorio: Tu renovación vence en ${data.daysUntilRenewal} día${data.daysUntilRenewal !== 1 ? 's' : ''}`,
    react: RenewalReminderEmail({
      clientName: data.clientName,
      storeName: data.storeName,
      renewalDate: data.renewalDate,
      daysUntilRenewal: data.daysUntilRenewal,
      dashboardUrl,
      supportEmail: emailConfig.supportEmail,
      companyName: emailConfig.companyName
    })
  })
}
