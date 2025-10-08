import { Text, Heading, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './layout'

interface ClientSuspendedAdminEmailProps {
  clientName: string
  clientEmail: string
  storeName: string
  storeSlug: string
  suspensionReason: string
  suspendedAt: Date
  suspendedBy: string
  companyName: string
}

export function ClientSuspendedAdminEmail({
  clientName,
  clientEmail,
  storeName,
  storeSlug,
  suspensionReason,
  suspendedAt,
  suspendedBy,
  companyName
}: ClientSuspendedAdminEmailProps) {
  const suspensionDate = new Date(suspendedAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <EmailLayout
      preview={`Cliente suspendido: ${clientName}`}
      companyName={companyName}
    >
      <Heading style={h2}>🔴 Cliente suspendido</Heading>

      <Text style={text}>
        Se ha suspendido la cuenta de un cliente en {companyName}.
      </Text>

      <Section style={alertBox}>
        <Text style={alertTitle}>👤 Cliente afectado</Text>
        <Text style={infoText}><strong>Nombre:</strong> {clientName}</Text>
        <Text style={infoText}><strong>Email:</strong> {clientEmail}</Text>
        <Text style={infoText}><strong>Tienda:</strong> {storeName}</Text>
        <Text style={infoText}><strong>Slug:</strong> {storeSlug}</Text>
      </Section>

      <Section style={reasonBox}>
        <Text style={alertTitle}>📋 Detalles de la suspensión</Text>
        <Text style={infoText}><strong>Motivo:</strong> {suspensionReason}</Text>
        <Text style={infoText}><strong>Fecha:</strong> {suspensionDate}</Text>
        <Text style={infoText}><strong>Suspendido por:</strong> {suspendedBy}</Text>
      </Section>

      <Text style={mutedText}>
        El cliente ha sido notificado por email. Su tienda pública ya no está accesible.
      </Text>
    </EmailLayout>
  )
}

const h2 = { color: '#dc2626', fontSize: '20px', fontWeight: '700', margin: '16px 0' }
const text = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '16px 0' }
const alertBox = { backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const reasonBox = { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const alertTitle = { color: '#1f2937', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }
const infoText = { color: '#374151', fontSize: '14px', lineHeight: '20px', margin: '8px 0' }
const mutedText = { color: '#6b7280', fontSize: '12px', margin: '24px 0 0 0' }

export default ClientSuspendedAdminEmail
