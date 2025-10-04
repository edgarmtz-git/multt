import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// POST - Aceptar invitación y crear usuario
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { message: 'Contraseña es requerida' },
        { status: 400 }
      )
    }

    // Buscar la invitación
    const invitation = await prisma.invitation.findUnique({
      where: { code }
    })

    if (!invitation) {
      return NextResponse.json(
        { message: 'Invitación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la invitación esté pendiente
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Esta invitación ya ha sido utilizada o cancelada' },
        { status: 400 }
      )
    }

    // Verificar que no haya expirado
    const now = new Date()
    if (now > invitation.expiresAt) {
      // Marcar como expirada
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      
      return NextResponse.json(
        { message: 'Esta invitación ha expirado' },
        { status: 400 }
      )
    }

    // Verificar que el email no esté en uso
    const existingUser = await prisma.user.findFirst({
      where: { email: invitation.clientEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Verificar que el slug no esté en uso
    const existingSlug = await prisma.user.findFirst({
      where: { company: invitation.slug }
    })

    if (existingSlug) {
      return NextResponse.json(
        { message: 'Este slug ya está en uso' },
        { status: 400 }
      )
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario usando transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el usuario
      const user = await tx.user.create({
        data: {
          email: invitation.clientEmail,
          name: invitation.clientName,
          password: hashedPassword,
          role: 'CLIENT',
          company: invitation.slug,
          isActive: true
        }
      })

      // Crear productos de ejemplo para el nuevo usuario
      const sampleProducts = [
        {
          name: "Producto de Ejemplo 1",
          description: "Descripción del producto de ejemplo",
          price: 99.99,
          category: "General",
          stock: 10,
          userId: user.id
        },
        {
          name: "Producto de Ejemplo 2", 
          description: "Otro producto de ejemplo para comenzar",
          price: 149.99,
          category: "Servicios",
          stock: 5,
          userId: user.id
        }
      ]

      await tx.product.createMany({
        data: sampleProducts
      })

      // Marcar invitación como usada
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'USED',
          usedAt: new Date(),
          serviceStart: new Date(),
          serviceRenewal: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 año
          isActive: true
        }
      })

      return user
    })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        company: result.company
      }
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
