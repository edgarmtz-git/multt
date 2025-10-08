import { Text, Heading, Button, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './layout'

interface InvitationAcceptedAdminEmailProps {
  clientName: string
  clientEmail: string
  storeName: string
  storeSlug: string
  activatedAt: Date
  renewalDate: Date
  adminDashboardUrl: string
  companyName: string
}

export function InvitationAcceptedAdminEmail({
  clientName,
  clientEmail,
  storeName,
  storeSlug,
  activatedAt,
  renewalDate,
  adminDashboardUrl,
  companyName
}: InvitationAcceptedAdminEmailProps) {
  const activationDate = new Date(activatedAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const renewalDateFormatted = new Date(renewalDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <EmailLayout
      preview={`Nueva activación: ${clientName}`}
      companyName={companyName}
    >
      <Heading style={h2}>✅ Nueva cuenta activada</Heading>

      <Text style={text}>
        Un cliente ha aceptado su invitación y activado su cuenta en {companyName}.
      </Text>

      <Section style={infoBox}>
        <Text style={infoTitle}>👤 Información del cliente</Text>
        <Text style={infoText}><strong>Nombre:</strong> {clientName}</Text>
        <Text style={infoText}><strong>Email:</strong> {clientEmail}</Text>
        <Text style={infoText}><strong>Tienda:</strong> {storeName}</Text>
        <Text style={infoText}><strong>Slug:</strong> {storeSlug}</Text>
      </Section>

      <Section style={dateBox}>
        <Text style={infoTitle}>📅 Fechas importantes</Text>
        <Text style={infoText}><strong>Activación:</strong> {activationDate}</Text>
        <Text style={infoText}><strong>Renovación:</strong> {renewalDateFormatted}</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={adminDashboardUrl}>
          Ver en Panel Admin
        </Button>
      </Section>

      <Text style={mutedText}>
        Este es un mensaje automático del sistema de gestión de clientes.
      </Text>
    </EmailLayout>
  )
}

const h2 = { color: '#1f2937', fontSize: '20px', fontWeight: '700', margin: '16px 0' }
const text = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '16px 0' }
const infoBox = { backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const dateBox = { backgroundColor: '#fef3c7', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const infoTitle = { color: '#1f2937', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }
const infoText = { color: '#374151', fontSize: '14px', lineHeight: '20px', margin: '8px 0' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }
const mutedText = { color: '#6b7280', fontSize: '12px', margin: '24px 0 0 0' }

export default InvitationAcceptedAdminEmail
