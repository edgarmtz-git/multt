import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los clientes con información de invitación
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    // Obtener todos los usuarios con rol CLIENT
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: {
        storeSettings: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            storeActive: true,
            whatsappMainNumber: true,
            email: true
          }
        },
        _count: {
          select: {
            products: true,
            orders: true,
            categories: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Para cada cliente, buscar su invitación
    const clientsWithInvitations = await Promise.all(
      clients.map(async (client) => {
        const invitation = await prisma.invitation.findFirst({
          where: { clientEmail: client.email },
          select: {
            id: true,
            serviceStart: true,
            serviceRenewal: true,
            status: true
          }
        })

        return {
          id: client.id,
          email: client.email,
          name: client.name,
          company: client.company,
          role: client.role,
          isActive: client.isActive,
          isSuspended: client.isSuspended,
          suspensionReason: client.suspensionReason,
          suspendedAt: client.suspendedAt,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
          invitation: invitation || null,
          storeSettings: client.storeSettings || null,
          stats: {
            products: client._count.products,
            orders: client._count.orders,
            categories: client._count.categories
          }
        }
      })
    )

    return NextResponse.json(clientsWithInvitations)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
