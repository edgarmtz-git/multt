// Configuración de Resend para envío de emails

import { Resend } from 'resend'

// Inicializar Resend con API key
export const resend = new Resend(process.env.RESEND_API_KEY)

// Configuración de emails
export const emailConfig = {
  from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  companyName: process.env.COMPANY_NAME || 'Multt',
  supportEmail: process.env.SUPPORT_EMAIL || 'soporte@tudominio.com',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@tudominio.com',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
}

// Helper para verificar si el email está configurado
export const isEmailConfigured = (): boolean => {
  return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
}

// Helper para modo de desarrollo (logs en lugar de enviar)
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development'
}
