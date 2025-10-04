const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyMariaDeleted() {
  try {
    console.log('🔍 Verificando si María García López fue eliminada...\n')
    
    // Buscar la invitación de María
    const maria = await prisma.invitation.findFirst({
      where: { clientEmail: 'maria@techstartup.com' }
    })
    
    if (!maria) {
      console.log('✅ ¡ÉXITO! María García López fue eliminada correctamente')
      console.log('   - La invitación ya no existe en la base de datos')
      console.log('   - El email maria@techstartup.com está disponible')
      console.log('   - El slug tech-startup-maria está disponible\n')
    } else {
      console.log('❌ María todavía existe:')
      console.log(`   - ID: ${maria.id}`)
      console.log(`   - Status: ${maria.status}`)
    }
    
    // Mostrar todas las invitaciones restantes
    const allInvitations = await prisma.invitation.findMany({
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        status: true
      }
    })
    
    console.log(`📋 Invitaciones restantes: ${allInvitations.length}`)
    allInvitations.forEach((inv, index) => {
      console.log(`${index + 1}. ${inv.clientName} (${inv.clientEmail}) - ${inv.status}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyMariaDeleted()
