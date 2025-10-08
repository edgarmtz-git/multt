import { Text, Heading, Button, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './layout'

interface ClientReactivatedEmailProps {
  clientName: string
  storeName: string
  storeSlug: string
  reactivatedAt: Date
  dashboardUrl: string
  storeUrl: string
  companyName: string
}

export function ClientReactivatedEmail({
  clientName,
  storeName,
  storeSlug,
  reactivatedAt,
  dashboardUrl,
  storeUrl,
  companyName
}: ClientReactivatedEmailProps) {
  const reactivationDate = new Date(reactivatedAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <EmailLayout
      preview={`¡Tu cuenta en ${companyName} ha sido reactivada!`}
      companyName={companyName}
    >
      <Heading style={h2}>✅ ¡Bienvenido de vuelta!</Heading>

      <Text style={text}>Hola {clientName},</Text>

      <Text style={text}>
        Nos complace informarte que tu cuenta y tienda <strong>{storeName}</strong> han sido reactivadas exitosamente.
      </Text>

      <Section style={successBox}>
        <Text style={successTitle}>🎉 Tu cuenta está activa nuevamente</Text>
        <Text style={infoText}><strong>Tienda:</strong> {storeName}</Text>
        <Text style={infoText}><strong>Slug:</strong> {storeSlug}</Text>
        <Text style={infoText}><strong>Reactivada:</strong> {reactivationDate}</Text>
      </Section>

      <Hr style={hr} />

      <Text style={sectionTitle}>🚀 Ya puedes continuar operando:</Text>

      <Text style={stepText}>
        ✓ Tu tienda pública está nuevamente accesible
      </Text>

      <Text style={stepText}>
        ✓ Puedes gestionar tus productos y pedidos
      </Text>

      <Text style={stepText}>
        ✓ Tus clientes pueden realizar nuevos pedidos
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Ir a mi Dashboard
        </Button>
      </Section>

      <Text style={text}>
        Tu tienda pública está disponible en:
      </Text>

      <Text style={linkText}>{storeUrl}</Text>

      <Hr style={hr} />

      <Text style={text}>
        ¡Gracias por seguir confiando en {companyName}! 🎊
      </Text>

      <Text style={mutedText}>
        Si tienes alguna pregunta, no dudes en contactarnos.
      </Text>
    </EmailLayout>
  )
}

const h2 = { color: '#059669', fontSize: '20px', fontWeight: '700', margin: '16px 0' }
const text = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '16px 0' }
const sectionTitle = { color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '24px 0 12px 0' }
const stepText = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '8px 0', paddingLeft: '8px' }
const successBox = { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const successTitle = { color: '#059669', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }
const infoText = { color: '#374151', fontSize: '14px', lineHeight: '20px', margin: '8px 0' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#059669', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }
const linkText = { color: '#3b82f6', fontSize: '12px', wordBreak: 'break-all' as const, margin: '8px 0', textDecoration: 'underline' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const mutedText = { color: '#6b7280', fontSize: '12px', margin: '24px 0 0 0' }

export default ClientReactivatedEmail
