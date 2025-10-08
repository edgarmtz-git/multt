import { Text, Heading, Section, Hr, Button } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './layout'

interface ClientSuspendedEmailProps {
  clientName: string
  storeName: string
  suspensionReason: string
  suspendedAt: Date
  supportEmail: string
  companyName: string
}

export function ClientSuspendedEmail({
  clientName,
  storeName,
  suspensionReason,
  suspendedAt,
  supportEmail,
  companyName
}: ClientSuspendedEmailProps) {
  const suspensionDate = new Date(suspendedAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <EmailLayout
      preview={`Tu cuenta en ${companyName} ha sido suspendida`}
      companyName={companyName}
    >
      <Heading style={h2}>⚠️ Cuenta suspendida</Heading>

      <Text style={text}>Hola {clientName},</Text>

      <Text style={text}>
        Lamentamos informarte que tu cuenta y tienda <strong>{storeName}</strong> han sido suspendidas temporalmente.
      </Text>

      <Section style={alertBox}>
        <Text style={alertTitle}>📋 Detalles de la suspensión</Text>
        <Text style={infoText}><strong>Motivo:</strong> {suspensionReason}</Text>
        <Text style={infoText}><strong>Fecha:</strong> {suspensionDate}</Text>
        <Text style={infoText}><strong>Estado:</strong> Tu tienda no está accesible al público</Text>
      </Section>

      <Hr style={hr} />

      <Text style={sectionTitle}>🔄 Para reactivar tu cuenta:</Text>

      <Text style={stepText}>
        1. Contacta con nuestro equipo de soporte
      </Text>

      <Text style={stepText}>
        2. Resuelve el motivo de la suspensión
      </Text>

      <Text style={stepText}>
        3. Espera la confirmación de reactivación
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`mailto:${supportEmail}`}>
          Contactar Soporte
        </Button>
      </Section>

      <Text style={contactText}>
        También puedes escribirnos a: <strong>{supportEmail}</strong>
      </Text>

      <Hr style={hr} />

      <Text style={mutedText}>
        Este mensaje es informativo. Tu acceso al dashboard permanecerá limitado hasta la reactivación de tu cuenta.
      </Text>
    </EmailLayout>
  )
}

const h2 = { color: '#dc2626', fontSize: '20px', fontWeight: '700', margin: '16px 0' }
const text = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '16px 0' }
const sectionTitle = { color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '24px 0 12px 0' }
const stepText = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '8px 0', paddingLeft: '8px' }
const alertBox = { backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const alertTitle = { color: '#dc2626', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }
const infoText = { color: '#374151', fontSize: '14px', lineHeight: '20px', margin: '8px 0' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }
const contactText = { color: '#374151', fontSize: '14px', textAlign: 'center' as const, margin: '16px 0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const mutedText = { color: '#6b7280', fontSize: '12px', margin: '24px 0 0 0' }

export default ClientSuspendedEmail
