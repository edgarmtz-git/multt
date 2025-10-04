import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Validar si un slug está disponible
export async function GET(request: NextRequest) {
  console.log('🔍 Validating slug API called')
  
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug es requerido' },
        { status: 400 }
      )
    }

    // Validar formato del slug
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { message: 'El slug solo puede contener letras minúsculas, números y guiones' },
        { status: 400 }
      )
    }

    // Verificar que no esté en uso en invitaciones
    const existingInvitation = await prisma.invitation.findFirst({
      where: { slug }
    })

    if (existingInvitation) {
      return NextResponse.json(
        { message: 'Este slug ya está reservado en una invitación' },
        { status: 409 }
      )
    }

    // Verificar que no esté en uso por usuarios existentes
    const existingUser = await prisma.user.findFirst({
      where: { company: slug }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este slug ya está en uso por otro cliente' },
        { status: 409 }
      )
    }

    // Slug disponible
    return NextResponse.json({
      message: 'Slug disponible',
      available: true
    })

  } catch (error) {
    console.error('Error validating slug:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
