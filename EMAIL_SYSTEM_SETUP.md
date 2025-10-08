# Sistema de Emails - Guía Completa

## 🎯 Por qué necesitas emails

Actualmente NO tienes sistema de emails, lo cual es crítico para:

- 📧 **Confirmación de pedidos** (cliente y vendedor)
- 🔐 **Recuperación de contraseña**
- 👋 **Bienvenida a nuevos clientes**
- 💳 **Notificaciones de pago**
- 📊 **Reportes periódicos**
- ⚠️ **Alertas de stock bajo**

---

## 📋 Opciones de Proveedores de Email

### **Opción 1: Resend (Recomendada)** ⭐

```bash
# Instalación
pnpm add resend react-email @react-email/components
```

**Pros:**
- **SÚPER fácil de usar** (API moderna)
- Free tier generoso (3,000 emails/mes)
- React Email templates (diseño en código)
- Excelente deliverability
- Dashboard limpio

**Cons:**
- Relativamente nuevo
- Menos features enterprise que SendGrid

**Precio:**
- Free: 3,000 emails/mes
- Pro: $20/mes = 50,000 emails

---

### **Opción 2: SendGrid (Más establecido)**

```bash
# Instalación
pnpm add @sendgrid/mail
```

**Pros:**
- Muy establecido y confiable
- Free tier: 100 emails/día
- Templates HTML en dashboard
- Analytics avanzados

**Cons:**
- API más antigua
- Setup más complejo
- Dashboard menos intuitivo

**Precio:**
- Free: 100 emails/día
- Essentials: $20/mes = 50,000 emails

---

### **Opción 3: Postmark (Mejor deliverability)**

```bash
# Instalación
pnpm add postmark
```

**Pros:**
- Deliverability casi perfecto (99%+)
- Especializado en transaccional
- Muy confiable

**Cons:**
- Más caro
- No hay free tier

**Precio:**
- $15/mes = 10,000 emails

---

## 🔧 Implementación: Resend + React Email

### **Paso 1: Instalación**

```bash
pnpm add resend react-email @react-email/components
```

### **Paso 2: Configuración**

```bash
# .env.local
RESEND_API_KEY=re_123456789

# Obtener API key en: https://resend.com/api-keys
```

### **Paso 3: Crear templates con React Email**

```typescript
// emails/order-confirmation.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  storeName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
}

export default function OrderConfirmationEmail({
  customerName,
  orderNumber,
  storeName,
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryMethod,
  deliveryAddress,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu pedido #{orderNumber} ha sido confirmado</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Pedido Confirmado! 🎉</Heading>

          <Text style={text}>
            Hola {customerName},
          </Text>

          <Text style={text}>
            Tu pedido <strong>#{orderNumber}</strong> ha sido confirmado y está siendo procesado por <strong>{storeName}</strong>.
          </Text>

          <Section style={orderBox}>
            <Heading as="h2" style={h2}>Resumen del Pedido</Heading>

            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemCol}>
                  <Text style={itemText}>
                    {item.quantity}x {item.name}
                  </Text>
                </Column>
                <Column align="right" style={priceCol}>
                  <Text style={itemText}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}

            <div style={divider} />

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal:</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>${subtotal.toFixed(2)}</Text>
              </Column>
            </Row>

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Envío:</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>${deliveryFee.toFixed(2)}</Text>
              </Column>
            </Row>

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabelBold}>Total:</Text>
              </Column>
              <Column align="right">
                <Text style={totalValueBold}>${total.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={deliveryBox}>
            <Heading as="h2" style={h2}>
              {deliveryMethod === 'pickup' ? '📦 Recoger en tienda' : '🚚 Entrega a domicilio'}
            </Heading>
            {deliveryMethod === 'delivery' && deliveryAddress && (
              <Text style={text}>
                <strong>Dirección de entrega:</strong><br />
                {deliveryAddress}
              </Text>
            )}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Recibirás actualizaciones sobre tu pedido por WhatsApp.
            </Text>
            <Text style={footerText}>
              Gracias por tu compra,<br />
              {storeName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 20px',
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '16px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 20px',
};

const orderBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  margin: '20px',
  padding: '20px',
};

const itemRow = {
  marginBottom: '8px',
};

const itemCol = {
  width: '70%',
};

const priceCol = {
  width: '30%',
};

const itemText = {
  color: '#333',
  fontSize: '14px',
  margin: '0',
};

const divider = {
  borderTop: '1px solid #e5e7eb',
  margin: '16px 0',
};

const totalRow = {
  marginTop: '8px',
};

const totalLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const totalValue = {
  color: '#333',
  fontSize: '14px',
  margin: '0',
};

const totalLabelBold = {
  ...totalLabel,
  fontWeight: 'bold',
  fontSize: '16px',
};

const totalValueBold = {
  ...totalValue,
  fontWeight: 'bold',
  fontSize: '16px',
};

const deliveryBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  margin: '20px',
  padding: '20px',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
};
```

### **Paso 4: Email para vendedor (notificación de nuevo pedido)**

```typescript
// emails/new-order-vendor.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NewOrderVendorEmailProps {
  vendorName: string;
  orderNumber: string;
  customerName: string;
  customerWhatsApp: string;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  deliveryMethod: string;
  deliveryAddress?: string;
  dashboardUrl: string;
}

export default function NewOrderVendorEmail({
  vendorName,
  orderNumber,
  customerName,
  customerWhatsApp,
  items,
  total,
  deliveryMethod,
  deliveryAddress,
  dashboardUrl,
}: NewOrderVendorEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nuevo pedido #{orderNumber} recibido</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🔔 Nuevo Pedido Recibido</Heading>

          <Text style={text}>
            Hola {vendorName},
          </Text>

          <Text style={text}>
            Has recibido un nuevo pedido <strong>#{orderNumber}</strong>.
          </Text>

          <Section style={customerBox}>
            <Heading as="h2" style={h2}>Información del Cliente</Heading>
            <Text style={text}>
              <strong>Nombre:</strong> {customerName}<br />
              <strong>WhatsApp:</strong> {customerWhatsApp}
            </Text>
          </Section>

          <Section style={orderBox}>
            <Heading as="h2" style={h2}>Productos</Heading>
            {items.map((item, index) => (
              <Text key={index} style={itemText}>
                • {item.quantity}x {item.name}
              </Text>
            ))}
            <Text style={totalText}>
              <strong>Total: ${total.toFixed(2)}</strong>
            </Text>
          </Section>

          <Section style={deliveryBox}>
            <Text style={text}>
              <strong>Método de entrega:</strong> {deliveryMethod}
              {deliveryAddress && (
                <>
                  <br /><br />
                  <strong>Dirección:</strong><br />
                  {deliveryAddress}
                </>
              )}
            </Text>
          </Section>

          <Button style={button} href={dashboardUrl}>
            Ver Pedido en Dashboard
          </Button>

          <Text style={footer}>
            También te hemos enviado la notificación por WhatsApp.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 20px',
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '16px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
};

const customerBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  margin: '20px',
  padding: '20px',
};

const orderBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  margin: '20px',
  padding: '20px',
};

const deliveryBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '20px',
  padding: '20px',
};

const itemText = {
  color: '#333',
  fontSize: '14px',
  margin: '4px 0',
};

const totalText = {
  color: '#333',
  fontSize: '18px',
  marginTop: '16px',
};

const button = {
  backgroundColor: '#000',
  borderRadius: '8px',
  color: '#fff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '12px 32px',
  margin: '32px auto',
  width: 'fit-content',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center' as const,
  marginTop: '32px',
};
```

### **Paso 5: Servicio de Email**

```typescript
// lib/email.ts
import { Resend } from 'resend';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import NewOrderVendorEmail from '@/emails/new-order-vendor';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation({
  to,
  customerName,
  orderNumber,
  storeName,
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryMethod,
  deliveryAddress,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  storeName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${storeName} <pedidos@tudominio.com>`,
      to: [to],
      subject: `Pedido #${orderNumber} confirmado`,
      react: OrderConfirmationEmail({
        customerName,
        orderNumber,
        storeName,
        items,
        subtotal,
        deliveryFee,
        total,
        deliveryMethod,
        deliveryAddress,
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendNewOrderToVendor({
  to,
  vendorName,
  orderNumber,
  customerName,
  customerWhatsApp,
  items,
  total,
  deliveryMethod,
  deliveryAddress,
  dashboardUrl,
}: {
  to: string;
  vendorName: string;
  orderNumber: string;
  customerName: string;
  customerWhatsApp: string;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  deliveryMethod: string;
  deliveryAddress?: string;
  dashboardUrl: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Sistema <notificaciones@tudominio.com>',
      to: [to],
      subject: `Nuevo pedido #${orderNumber}`,
      react: NewOrderVendorEmail({
        vendorName,
        orderNumber,
        customerName,
        customerWhatsApp,
        items,
        total,
        deliveryMethod,
        deliveryAddress,
        dashboardUrl,
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
```

### **Paso 6: Integrar en checkout**

```typescript
// app/api/orders/route.ts (agregar después de crear orden)
import { sendOrderConfirmation, sendNewOrderToVendor } from '@/lib/email';

export async function POST(request: NextRequest) {
  // ... código existente de creación de orden ...

  // Después de crear el pedido:
  const order = await prisma.order.create({ ... });

  // Enviar email al cliente
  await sendOrderConfirmation({
    to: customerEmail,
    customerName,
    orderNumber: order.orderNumber,
    storeName: storeInfo.storeName,
    items: cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal,
    deliveryFee,
    total,
    deliveryMethod,
    deliveryAddress: formatAddress(addressFields),
  });

  // Enviar email al vendedor
  await sendNewOrderToVendor({
    to: storeInfo.email,
    vendorName: storeInfo.storeName,
    orderNumber: order.orderNumber,
    customerName,
    customerWhatsApp,
    items: cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
    })),
    total,
    deliveryMethod: deliveryMethod === 'pickup' ? 'Recoger en tienda' : 'Entrega a domicilio',
    deliveryAddress: deliveryMethod === 'delivery' ? formatAddress(addressFields) : undefined,
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}`,
  });

  return NextResponse.json({ success: true, order });
}
```

---

## 📧 Emails Adicionales Recomendados

### **1. Bienvenida a nuevo cliente**

```typescript
// emails/welcome.tsx
export default function WelcomeEmail({ name, storeName, loginUrl }) {
  return (
    <Html>
      <Body>
        <Heading>¡Bienvenido a {storeName}! 🎉</Heading>
        <Text>Hola {name},</Text>
        <Text>
          Tu tienda online ya está lista. Comienza a agregar productos
          y personaliza tu página.
        </Text>
        <Button href={loginUrl}>Ir al Dashboard</Button>
      </Body>
    </Html>
  );
}
```

### **2. Recuperación de contraseña**

```typescript
// emails/reset-password.tsx
export default function ResetPasswordEmail({ name, resetUrl }) {
  return (
    <Html>
      <Body>
        <Heading>Recuperar Contraseña 🔐</Heading>
        <Text>Hola {name},</Text>
        <Text>
          Recibimos una solicitud para restablecer tu contraseña.
        </Text>
        <Button href={resetUrl}>Restablecer Contraseña</Button>
        <Text>
          Este enlace expira en 1 hora.
        </Text>
        <Text>
          Si no solicitaste esto, ignora este email.
        </Text>
      </Body>
    </Html>
  );
}
```

### **3. Actualización de estado de pedido**

```typescript
// emails/order-status-update.tsx
export default function OrderStatusUpdateEmail({
  customerName,
  orderNumber,
  status,
  statusMessage
}) {
  const statusEmoji = {
    'pending': '⏳',
    'confirmed': '✅',
    'preparing': '👨‍🍳',
    'ready': '📦',
    'delivered': '🎉',
    'cancelled': '❌'
  };

  return (
    <Html>
      <Body>
        <Heading>
          {statusEmoji[status]} Actualización de Pedido #{orderNumber}
        </Heading>
        <Text>Hola {customerName},</Text>
        <Text>{statusMessage}</Text>
      </Body>
    </Html>
  );
}
```

---

## 🔧 Configuración de Dominio

Para enviar emails desde tu dominio (`pedidos@tudominio.com`):

### **Opción 1: Resend**

1. Ir a Domains en Resend Dashboard
2. Agregar tu dominio
3. Agregar registros DNS (SPF, DKIM, DMARC)
4. Verificar dominio

```bash
# Registros DNS a agregar:
# SPF Record
TXT @ "v=spf1 include:resend.com ~all"

# DKIM Record (Resend te dará el valor específico)
TXT resend._domainkey "v=DKIM1; k=rsa; p=..."

# DMARC Record
TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@tudominio.com"
```

### **Opción 2: Usar subdominio**

```bash
# Más fácil y recomendado para empezar:
# Crear subdominio: mail.tudominio.com
# Configurar solo ese subdominio en Resend

# Enviar desde:
from: "Pedidos <pedidos@mail.tudominio.com>"
```

---

## 📊 Testing de Emails

### **Desarrollo local**

```typescript
// Para testing sin enviar emails reales:
// lib/email-dev.ts

export async function sendEmailDev(emailData: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 EMAIL (DEV MODE):', emailData);
    // Guardar en archivo o log
    return { success: true, dev: true };
  }

  // En producción, usar Resend real
  return sendEmail(emailData);
}
```

### **Preview de templates**

```bash
# Iniciar servidor de preview
pnpm email dev

# Abrir http://localhost:3000
# Ver todos los templates renderizados
```

---

## ✅ Checklist de Implementación

- [ ] Instalar Resend y React Email
- [ ] Configurar API key
- [ ] Crear template de confirmación de pedido
- [ ] Crear template de notificación a vendedor
- [ ] Integrar en flujo de pedidos
- [ ] Configurar dominio (opcional)
- [ ] Testing de emails
- [ ] Monitoreo de deliverability
- [ ] Crear templates adicionales (bienvenida, reset password)

---

## 🚀 Próximo Bloqueador

Con emails resuelto, el último bloqueador crítico es:
**Variables de Entorno de Producción Seguras**
