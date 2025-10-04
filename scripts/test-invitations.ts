import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

async function testInvitations() {
  console.log('🧪 Probando sistema de invitaciones...')

  try {
    // Crear una invitación de prueba
    const code = randomBytes(12).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expira en 7 días

    const invitation = await prisma.invitation.create({
      data: {
        code,
        clientName: 'Cliente de Prueba',
        clientEmail: 'prueba@test.com',
        clientPhone: '555-1234',
        slug: 'cliente-prueba',
        expiresAt,
        createdBy: 'admin-id', // ID del admin (ajustar según tu BD)
        status: 'PENDING'
      }
    })

    console.log('✅ Invitación creada:', {
      id: invitation.id,
      code: invitation.code,
      clientName: invitation.clientName,
      clientEmail: invitation.clientEmail,
      slug: invitation.slug,
      expiresAt: invitation.expiresAt
    })

    // Generar el link de invitación
    const invitationLink = `http://localhost:3000/invite/${invitation.code}`
    console.log('🔗 Link de invitación:', invitationLink)

    // Listar todas las invitaciones
    const allInvitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('📋 Total de invitaciones:', allInvitations.length)
    
    allInvitations.forEach((inv, index) => {
      console.log(`${index + 1}. ${inv.clientName} (${inv.clientEmail}) - ${inv.status}`)
    })

    console.log('\n🎯 Para probar el sistema:')
    console.log('1. Ve a: http://localhost:3000/admin/invitations')
    console.log('2. Inicia sesión como admin')
    console.log('3. Crea una nueva invitación')
    console.log('4. Copia el link y ábrelo en otra pestaña')
    console.log('5. Completa el formulario de registro')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testInvitations()
