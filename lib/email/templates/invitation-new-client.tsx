import { Text, Heading, Button, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './layout'

interface InvitationNewClientEmailProps {
  clientName: string
  clientEmail: string
  invitationCode: string
  slug: string
  expiresAt: Date
  appUrl: string
  companyName: string
}

export function InvitationNewClientEmail({
  clientName,
  clientEmail,
  invitationCode,
  slug,
  expiresAt,
  appUrl,
  companyName
}: InvitationNewClientEmailProps) {
  const inviteUrl = `${appUrl}/invite/${invitationCode}`
  const expiryDate = new Date(expiresAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <EmailLayout preview={`Bienvenido a ${companyName}`} companyName={companyName}>
      <Heading style={h2}>¡Bienvenido a {companyName}!</Heading>

      <Text style={text}>Hola {clientName},</Text>

      <Text style={text}>
        Has sido invitado a crear tu tienda en línea en {companyName}.
        Estamos emocionados de tenerte con nosotros.
      </Text>

      <Section style={infoBox}>
        <Text style={infoText}><strong>Tu tienda:</strong> {slug}</Text>
        <Text style={infoText}><strong>Email:</strong> {clientEmail}</Text>
        <Text style={infoText}><strong>Válido hasta:</strong> {expiryDate}</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={inviteUrl}>
          Activar mi cuenta
        </Button>
      </Section>

      <Text style={text}>
        O copia este enlace en tu navegador:
      </Text>
      <Text style={linkText}>{inviteUrl}</Text>
    </EmailLayout>
  )
}

const h2 = { color: '#1f2937', fontSize: '20px', fontWeight: '700', margin: '16px 0' }
const text = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '16px 0' }
const infoBox = { backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const infoText = { color: '#374151', fontSize: '14px', lineHeight: '20px', margin: '8px 0' }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }
const linkText = { color: '#6b7280', fontSize: '12px', wordBreak: 'break-all' as const, margin: '8px 0' }

export default InvitationNewClientEmail
