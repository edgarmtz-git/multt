import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener métodos de pago disponibles para una tienda
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Buscar la tienda por slug
    const store = await prisma.storeSettings.findUnique({
      where: { storeSlug: slug },
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
        paymentInstructions: true,
        storeActive: true
      }
    })

    if (!store) {
      return NextResponse.json({ message: 'Tienda no encontrada' }, { status: 404 })
    }

    if (!store.storeActive) {
      return NextResponse.json({ message: 'Tienda no disponible' }, { status: 403 })
    }

    if (!store.paymentsEnabled) {
      return NextResponse.json({ methods: [] })
    }

    const methods = []

    // Agregar pago en efectivo si está habilitado
    if (store.cashPaymentEnabled) {
      methods.push({
        type: 'cash',
        enabled: true,
        instructions: store.cashPaymentInstructions || 'Pago en efectivo al momento de la entrega',
        icon: 'banknote'
      })
    }

    // Agregar transferencia bancaria si está habilitada
    if (store.bankTransferEnabled && store.bankName && store.accountNumber && store.accountHolder) {
      methods.push({
        type: 'bank_transfer',
        enabled: true,
        instructions: store.transferInstructions || 'Realiza la transferencia y envía el comprobante',
        bankDetails: {
          bankName: store.bankName,
          accountNumber: store.accountNumber,
          accountHolder: store.accountHolder,
          clabe: store.clabe || ''
        },
        icon: 'building'
      })
    }

    return NextResponse.json({
      methods,
      generalInstructions: store.paymentInstructions
    })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
