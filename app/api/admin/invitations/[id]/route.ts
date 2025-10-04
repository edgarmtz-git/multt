import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Eliminar invitación
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Buscar la invitación
    const invitation = await prisma.invitation.findUnique({
      where: { id }
    })

    if (!invitation) {
      return NextResponse.json({ message: 'Invitación no encontrada' }, { status: 404 })
    }

    // Verificar que no esté ya usada
    if (invitation.status === 'USED') {
      return NextResponse.json(
        { message: 'No se puede eliminar una invitación que ya ha sido usada' },
        { status: 400 }
      )
    }

    // Eliminar la invitación
    await prisma.invitation.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Invitación eliminada exitosamente',
      deletedInvitation: {
        id: invitation.id,
        clientName: invitation.clientName,
        clientEmail: invitation.clientEmail,
        code: invitation.code
      }
    })
  } catch (error) {
    console.error('Error deleting invitation:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
