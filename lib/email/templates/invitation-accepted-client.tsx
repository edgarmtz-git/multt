import { Text, Heading, Button, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './layout'

interface InvitationAcceptedClientEmailProps {
  clientName: string
  storeName: string
  storeSlug: string
  dashboardUrl: string
  storeUrl: string
  companyName: string
}

export function InvitationAcceptedClientEmail({
  clientName,
  storeName,
  storeSlug,
  dashboardUrl,
  storeUrl,
  companyName
}: InvitationAcceptedClientEmailProps) {
  return (
    <EmailLayout
      preview={`¡Bienvenido a ${companyName}! Tu cuenta está activa`}
      companyName={companyName}
    >
      <Heading style={h2}>🎉 ¡Tu cuenta está activa!</Heading>

      <Text style={text}>Hola {clientName},</Text>

      <Text style={text}>
        ¡Felicitaciones! Has activado exitosamente tu cuenta en {companyName}.
        Tu tienda en línea <strong>{storeName}</strong> ya está lista para empezar a recibir pedidos.
      </Text>

      <Section style={infoBox}>
        <Text style={infoTitle}>📦 Información de tu tienda</Text>
        <Text style={infoText}><strong>Nombre:</strong> {storeName}</Text>
        <Text style={infoText}><strong>URL:</strong> {storeSlug}</Text>
        <Text style={infoText}><strong>Panel de control:</strong> Dashboard</Text>
      </Section>

      <Hr style={hr} />

      <Text style={sectionTitle}>🚀 Primeros pasos</Text>

      <Text style={stepText}>
        <strong>1. Accede a tu dashboard</strong><br />
        Gestiona tus productos, categorías, pedidos y configuración.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Ir a mi Dashboard
        </Button>
      </Section>

      <Text style={stepText}>
        <strong>2. Configura tu tienda</strong><br />
        Personaliza el nombre, logo, banner, horarios de atención y zonas de entrega.
      </Text>

      <Text style={stepText}>
        <strong>3. Agrega tus productos</strong><br />
        Crea categorías y añade tus productos con fotos, precios y descripciones.
      </Text>

      <Text style={stepText}>
        <strong>4. Comparte tu tienda</strong><br />
        Tu tienda pública está disponible en:
      </Text>

      <Text style={linkText}>{storeUrl}</Text>

      <Hr style={hr} />

      <Text style={text}>
        Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos.
      </Text>

      <Text style={text}>
        ¡Éxito con tu tienda! 🎊
      </Text>
    </EmailLayout>
  )
}

const h2 = { color: '#1f2937', fontSize: '20px', fontWeight: '700', margin: '16px 0' }
const text = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '16px 0' }
const sectionTitle = { color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '24px 0 12px 0' }
const stepText = { color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '12px 0', paddingLeft: '8px' }
const infoBox = { backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', margin: '24px 0' }
const infoTitle = { color: '#1f2937', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }
const infoText = { color: '#374151', fontSize: '14px', lineHeight: '20px', margin: '8px 0' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }
const linkText = { color: '#3b82f6', fontSize: '12px', wordBreak: 'break-all' as const, margin: '8px 0', textDecoration: 'underline' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }

export default InvitationAcceptedClientEmail
