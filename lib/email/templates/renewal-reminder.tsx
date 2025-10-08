import { Text, Heading, Button, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './layout'

interface RenewalReminderEmailProps {
  clientName: string
  storeName: string
  renewalDate: Date
  daysUntilRenewal: number
  dashboardUrl: string
  supportEmail: string
  companyName: string
}

export function RenewalReminderEmail({
  clientName,
  storeName,
  renewalDate,
  daysUntilRenewal,
  dashboardUrl,
  supportEmail,
  companyName
}: RenewalReminderEmailProps) {
  const renewalDateFormatted = new Date(renewalDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const urgency = daysUntilRenewal <= 1 ? 'critical' : daysUntilRenewal <= 3 ? 'warning' : 'info'

  const getUrgencyMessage = () => {
    if (daysUntilRenewal === 0) {
      return '¡Tu renovación vence HOY!'
    } else if (daysUntilRenewal === 1) {
      return '¡Tu renovación vence MAÑANA!'
    } else {
      return `Tu renovación vence en ${daysUntilRenewal} días`
    }
  }

  return (
    <EmailLayout
      preview={`Recordatorio: ${getUrgencyMessage()}`}
      companyName={companyName}
    >
      <Heading style={urgency === 'critical' ? h2Critical : urgency === 'warning' ? h2Warning : h2}>
        {urgency === 'critical' ? '🚨' : urgency === 'warning' ? '⚠️' : '📅'} Recordatorio de renovación
      </Heading>

      <Text style={text}>Hola {clientName},</Text>

      <Text style={text}>
        Este es un recordatorio sobre la renovación de tu suscripción para tu tienda <strong>{storeName}</strong>.
      </Text>

      <Section style={urgency === 'critical' ? alertBoxCritical : urgency === 'warning' ? alertBoxWarning : alertBox}>
        <Text style={urgency === 'critical' ? alertTitleCritical : urgency === 'warning' ? alertTitleWarning : alertTitle}>
          {getUrgencyMessage()}
        </Text>
        <Text style={infoText}><strong>Fecha de renovación:</strong> {renewalDateFormatted}</Text>
        <Text style={infoText}><strong>Tienda:</strong> {storeName}</Text>
      </Section>

      {urgency === 'critical' && (
        <Text style={warningText}>
          ⚠️ <strong>Importante:</strong> Si no renuevas a tiempo, tu tienda será suspendida automáticamente y no podrás recibir nuevos pedidos.
        </Text>
      )}

      <Hr style={hr} />

      <Text style={sectionTitle}>💳 Para renovar tu suscripción:</Text>

      <Text style={stepText}>
        1. Accede a tu panel de control
      </Text>

      <Text style={stepText}>
        2. Realiza el pago correspondiente
      </Text>

      <Text style={stepText}>
        3. Contacta a soporte para confirmar tu pago
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Renovar Ahora
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={contactText}>
        ¿Necesitas ayuda? Contáctanos en: <strong>{supportEmail}</strong>
      </Text>

      <Text style={mutedText}>
        Este es un recordatorio automático. Si ya renovaste, por favor ignora este mensaje.
      </Text>
    </EmailLayout>
  )
}

const h2 = { color: '#1f2937', fontSize: '20px', fontWeight: '700', margin: '16px 0' }
const h2Warning = { color: '#d97706', fontSize: '20px', fontWeight: '700', margin: '16px 0' }
const h2Critical = { color: '#dc2626', fontSize: '20px', fontWeight: '700', margin: '16px 0' }
const text = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '16px 0' }
const sectionTitle = { color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '24px 0 12px 0' }
const stepText = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '8px 0', paddingLeft: '8px' }
const alertBox = { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const alertBoxWarning = { backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const alertBoxCritical = { backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const alertTitle = { color: '#1e40af', fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }
const alertTitleWarning = { color: '#d97706', fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }
const alertTitleCritical = { color: '#dc2626', fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }
const infoText = { color: '#374151', fontSize: '14px', lineHeight: '20px', margin: '8px 0' }
const warningText = { color: '#dc2626', fontSize: '14px', lineHeight: '24px', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px', margin: '16px 0' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }
const contactText = { color: '#374151', fontSize: '14px', textAlign: 'center' as const, margin: '16px 0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const mutedText = { color: '#6b7280', fontSize: '12px', margin: '24px 0 0 0' }

export default RenewalReminderEmail
