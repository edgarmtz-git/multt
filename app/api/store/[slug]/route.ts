import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Store slug is required' }, { status: 400 })
    }

    // Buscar la tienda por slug
    const store = await prisma.user.findFirst({
      where: {
        storeSettings: {
          storeSlug: slug
        }
      },
      include: {
        storeSettings: true
      }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (!store.storeSettings) {
      return NextResponse.json({ error: 'Store settings not found' }, { status: 404 })
    }

    // Formatear la respuesta con la información de la tienda
    const storeInfo = {
      storeSlug: store.storeSettings.storeSlug,
      storeName: store.storeSettings.storeName || 'Tienda',
      whatsappMainNumber: store.storeSettings.whatsappMainNumber || '',
      phoneNumber: store.storeSettings.phoneNumber || '',
      deliveryEnabled: store.storeSettings.deliveryEnabled || false,
      baseDeliveryPrice: store.storeSettings.baseDeliveryPrice || 0,
      // Configuración de método de cálculo de envío
      deliveryCalculationMethod: store.storeSettings.deliveryCalculationMethod || 'manual',
      pricePerKm: store.storeSettings.pricePerKm || 0,
      minDeliveryFee: store.storeSettings.minDeliveryFee || 0,
      maxDeliveryDistance: store.storeSettings.maxDeliveryDistance || 10,
      manualDeliveryMessage: store.storeSettings.manualDeliveryMessage || 'El costo de envío se calculará al confirmar el pedido',
      // Configuración de pagos
      cashPaymentEnabled: store.storeSettings.cashPaymentEnabled || false,
      bankTransferEnabled: store.storeSettings.bankTransferEnabled || false,
      bankName: store.storeSettings.bankName || '',
      accountNumber: store.storeSettings.accountNumber || '',
      accountHolder: store.storeSettings.accountHolder || '',
      clabe: store.storeSettings.clabe || '',
      transferInstructions: store.storeSettings.transferInstructions || '',
      paymentInstructions: store.storeSettings.paymentInstructions || '',
      cashPaymentInstructions: store.storeSettings.cashPaymentInstructions || ''
    }

    console.log('🏪 Store API response:', { slug, storeInfo })

    return NextResponse.json(storeInfo)

  } catch (error) {
    console.error('Error fetching store info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
