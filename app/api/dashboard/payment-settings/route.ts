import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener configuración de pagos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { userId: session.user.id },
      select: {
        paymentsEnabled: true,
        cashPaymentEnabled: true,
        cashPaymentInstructions: true,
        bankTransferEnabled: true,
        bankName: true,
        accountNumber: true,
        accountHolder: true,
        clabe: true,
        transferInstructions: true,
        paymentInstructions: true
      }
    })

    if (!settings) {
      return NextResponse.json({ message: 'Configuración no encontrada' }, { status: 404 })
    }

    // Asegurar que todos los campos string tengan valores por defecto
    const safeSettings = {
      paymentsEnabled: settings.paymentsEnabled ?? true,
      cashPaymentEnabled: settings.cashPaymentEnabled ?? true,
      cashPaymentInstructions: settings.cashPaymentInstructions ?? '',
      bankTransferEnabled: settings.bankTransferEnabled ?? false,
      bankName: settings.bankName ?? '',
      accountNumber: settings.accountNumber ?? '',
      accountHolder: settings.accountHolder ?? '',
      clabe: settings.clabe ?? '',
      transferInstructions: settings.transferInstructions ?? '',
      paymentInstructions: settings.paymentInstructions ?? ''
    }

    return NextResponse.json(safeSettings)
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar configuración de pagos
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      paymentsEnabled,
      cashPaymentEnabled,
      cashPaymentInstructions,
      bankTransferEnabled,
      bankName,
      accountNumber,
      accountHolder,
      clabe,
      transferInstructions,
      paymentInstructions
    } = body

    // Validaciones
    if (bankTransferEnabled && (!bankName || !accountNumber || !accountHolder)) {
      return NextResponse.json(
        { message: 'Para habilitar transferencias bancarias, debes completar todos los campos bancarios' },
        { status: 400 }
      )
    }

    if (clabe && clabe.length !== 18) {
      return NextResponse.json(
        { message: 'La CLABE debe tener exactamente 18 dígitos' },
        { status: 400 }
      )
    }

    const updatedSettings = await prisma.storeSettings.update({
      where: { userId: session.user.id },
      data: {
        paymentsEnabled: paymentsEnabled !== undefined ? paymentsEnabled : true,
        cashPaymentEnabled: cashPaymentEnabled !== undefined ? cashPaymentEnabled : true,
        cashPaymentInstructions,
        bankTransferEnabled: bankTransferEnabled !== undefined ? bankTransferEnabled : false,
        bankName,
        accountNumber,
        accountHolder,
        clabe,
        transferInstructions,
        paymentInstructions
      }
    })

    return NextResponse.json({
      message: 'Configuración de pagos actualizada correctamente',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
