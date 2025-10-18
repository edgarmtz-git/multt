import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener detalles de un cliente específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Obtener el cliente con todos sus datos relacionados
    const client = await prisma.user.findUnique({
      where: { id },
      include: {
        storeSettings: true,
        products: {
          orderBy: { createdAt: 'desc' }
        },
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    // Buscar invitación asociada
    const invitation = await prisma.invitation.findFirst({
      where: { clientEmail: client.email }
    })

    // Formatear la respuesta
    const clientDetails = {
      id: client.id,
      email: client.email,
      name: client.name,
      company: client.company,
      role: client.role,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      storeSettings: client.storeSettings ? {
        id: client.storeSettings.id,
        storeName: client.storeSettings.storeName,
        storeSlug: client.storeSettings.storeSlug,
        storeActive: client.storeSettings.storeActive,
        whatsappMainNumber: client.storeSettings.whatsappMainNumber
      } : null,
      invitation: invitation ? {
        id: invitation.id,
        code: invitation.code,
        clientName: invitation.clientName,
        clientEmail: invitation.clientEmail,
        clientPhone: invitation.clientPhone,
        slug: invitation.slug,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        usedAt: invitation.usedAt,
        serviceStart: invitation.serviceStart,
        serviceRenewal: invitation.serviceRenewal,
        isActive: invitation.isActive
      } : null,
      products: client.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: 'Sin categoría', // TODO: Implementar relación con categorías
        stock: product.stock,
        createdAt: product.createdAt
      })),
      orders: client.orders.map((order: any) => ({
        id: order.id,
        status: order.status,
        total: order.total,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        notes: order.notes,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            name: item.product.name
          }
        }))
      }))
    }

    return NextResponse.json(clientDetails)
  } catch (error) {
    console.error('Error fetching client details:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}