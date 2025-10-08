import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar .env.local ANTES de importar cualquier otra cosa
config({ path: resolve(process.cwd(), '.env.local') });

import { prisma } from '../lib/prisma';
import { sendInvitationEmail } from '../lib/email/send-emails';

async function resendInvitation() {
  try {
    const invitation = await prisma.invitation.findFirst({
      where: {
        clientEmail: 'frikilabs.dev@gmail.com',
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!invitation) {
      console.log('❌ No se encontró invitación pendiente para frikilabs.dev@gmail.com');
      return;
    }

    console.log('📧 Reenviando invitación:');
    console.log('   Email:', invitation.clientEmail);
    console.log('   Código:', invitation.code);
    console.log('   Slug:', invitation.slug);
    console.log('   Expira:', invitation.expiresAt);

    await sendInvitationEmail({
      clientName: invitation.clientName,
      clientEmail: invitation.clientEmail,
      invitationCode: invitation.code,
      slug: invitation.slug,
      expiresAt: invitation.expiresAt
    });

    console.log('✅ Email reenviado exitosamente');
  } catch (error) {
    console.error('❌ Error reenviando invitación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resendInvitation();
