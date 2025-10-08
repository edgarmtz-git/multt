// Funciones principales para envío de emails

import { resend, emailConfig, isEmailConfigured, isDevelopment } from './config'

interface SendEmailParams {
  to: string | string[]
  subject: string
  react: React.ReactElement
  cc?: string | string[]
  bcc?: string | string[]
}

/**
 * Enviar email usando Resend
 * Ahora envía emails reales tanto en desarrollo como producción
 */
export async function sendEmail({ to, subject, react, cc, bcc }: SendEmailParams) {
  try {
    // Verificar configuración
    if (!isEmailConfigured()) {
      console.warn('⚠️ Email no configurado. Variables faltantes: RESEND_API_KEY o RESEND_FROM_EMAIL')

      console.log('📧 [SIMULADO] Email que se enviaría:', {
        from: emailConfig.from,
        to,
        subject,
        cc,
        bcc
      })
      return { success: true, id: 'simulated-email', mode: 'simulated' }
    }

    // Enviar email real (tanto en desarrollo como producción)
    console.log(`📧 Enviando email a: ${Array.isArray(to) ? to.join(', ') : to}`)
    console.log(`   Asunto: ${subject}`)
    console.log(`   From: ${emailConfig.from}`)

    const data = await resend.emails.send({
      from: emailConfig.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      ...(cc && { cc: Array.isArray(cc) ? cc : [cc] }),
      ...(bcc && { bcc: Array.isArray(bcc) ? bcc : [bcc] }),
    })

    console.log(`✅ Email enviado exitosamente - Response:`, JSON.stringify(data, null, 2))

    if (data.error) {
      console.error('❌ Resend error:', data.error)
      return { success: false, error: data.error.message || 'Error sending email' }
    }

    return { success: true, id: data.data?.id, mode: isDevelopment() ? 'development' : 'production' }

  } catch (error) {
    console.error('❌ Error enviando email:', error)
    // No lanzar error para no bloquear el flujo principal
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Re-exportar configuración para facilitar imports
export { emailConfig }
