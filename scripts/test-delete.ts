import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDelete() {
  console.log('🧪 Probando eliminación de invitación...\n')

  try {
    // Buscar una invitación para eliminar
    const invitation = await prisma.invitation.findFirst({
      where: { status: 'PENDING' }
    })

    if (!invitation) {
      console.log('❌ No hay invitaciones pendientes para eliminar')
      return
    }

    console.log(`📧 Invitación encontrada: ${invitation.clientName} (${invitation.clientEmail})`)
    console.log(`🆔 ID: ${invitation.id}`)

    // Intentar eliminar
    console.log('\n🗑️ Eliminando invitación...')
    
    const deletedInvitation = await prisma.invitation.delete({
      where: { id: invitation.id }
    })

    console.log('✅ Invitación eliminada exitosamente:')
    console.log(`   - ID: ${deletedInvitation.id}`)
    console.log(`   - Nombre: ${deletedInvitation.clientName}`)
    console.log(`   - Email: ${deletedInvitation.clientEmail}`)

    // Verificar que se eliminó
    console.log('\n🔍 Verificando eliminación...')
    const checkInvitation = await prisma.invitation.findUnique({
      where: { id: invitation.id }
    })

    if (checkInvitation) {
      console.log('❌ ERROR: La invitación aún existe en la base de datos')
    } else {
      console.log('✅ Confirmado: La invitación fue eliminada correctamente')
    }

    // Mostrar invitaciones restantes
    const remainingInvitations = await prisma.invitation.findMany()
    console.log(`\n📋 Invitaciones restantes: ${remainingInvitations.length}`)

  } catch (error) {
    console.error('❌ Error eliminando invitación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDelete()
