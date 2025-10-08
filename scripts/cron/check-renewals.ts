import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const REMINDER_DAYS = [7, 3, 1, 0]

async function checkRenewals() {
  console.log('🔍 Iniciando verificación de renovaciones...')
  console.log('📅 Fecha actual:', new Date().toLocaleString('es-ES'))

  try {
    const activeInvitations = await prisma.invitation.findMany({
      where: {
        status: 'USED',
        isActive: true,
        serviceRenewal: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isSuspended: true,
            storeSettings: {
              select: {
                storeName: true,
                storeSlug: true
              }
            }
          }
        }
      }
    })

    console.log('📊 Invitaciones activas encontradas:', activeInvitations.length)

    let emailsSent = 0
    let errors = 0

    for (const invitation of activeInvitations) {
      if (!invitation.user || invitation.user.isSuspended) {
        continue
      }

      const renewalDate = new Date(invitation.serviceRenewal!)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      renewalDate.setHours(0, 0, 0, 0)

      const daysUntilRenewal = Math.ceil(
        (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (!REMINDER_DAYS.includes(daysUntilRenewal)) {
        continue
      }

      const storeName = invitation.user.storeSettings?.storeName || invitation.slug
      const storeSlug = invitation.user.storeSettings?.storeSlug || invitation.slug

      try {
        const { sendRenewalReminderEmail } = await import('../../lib/email/send-emails')
        
        await sendRenewalReminderEmail({
          clientName: invitation.user.name,
          clientEmail: invitation.user.email,
          storeName,
          renewalDate: invitation.serviceRenewal!,
          daysUntilRenewal
        })

        console.log(`✅ Email enviado a ${invitation.user.email} - ${daysUntilRenewal} día(s) hasta renovación`)
        emailsSent++
      } catch (error) {
        console.error(`❌ Error enviando email a ${invitation.user.email}:`, error)
        errors++
      }
    }

    console.log('\n📊 Resumen:')
    console.log('   ✅ Emails enviados:', emailsSent)
    console.log('   ❌ Errores:', errors)
    console.log('   📧 Total procesados:', activeInvitations.length)
    console.log('\n✅ Verificación completada\n')

    return { emailsSent, errors, total: activeInvitations.length }
  } catch (error) {
    console.error('❌ Error en verificación de renovaciones:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkRenewals()
  .then((result) => {
    console.log('🎉 Script ejecutado exitosamente:', result)
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
