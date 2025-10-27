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
    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeSlug: slug
      }
    })

    if (!storeSettings) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Formatear la respuesta con la información de la tienda
    const storeInfo = {
      storeSlug: storeSettings.storeSlug,
      storeName: storeSettings.storeName || 'Tienda',
      whatsappMainNumber: storeSettings.whatsappMainNumber || '',
      phoneNumber: storeSettings.phoneNumber || '',
      deliveryEnabled: storeSettings.deliveryEnabled || false,
      baseDeliveryPrice: storeSettings.baseDeliveryPrice || 0,
      // Configuración de método de cálculo de envío
      deliveryCalculationMethod: storeSettings.deliveryCalculationMethod || 'manual',
      pricePerKm: storeSettings.pricePerKm || 0,
      minDeliveryFee: storeSettings.minDeliveryFee || 0,
      maxDeliveryDistance: storeSettings.maxDeliveryDistance || 10,
      manualDeliveryMessage: storeSettings.manualDeliveryMessage || 'El costo de envío se calculará al confirmar el pedido',
      // Configuración de horarios
      enableBusinessHours: storeSettings.enableBusinessHours || false,
      unifiedSchedule: storeSettings.unifiedSchedule,
      // Configuración de pagos
      cashPaymentEnabled: storeSettings.cashPaymentEnabled || false,
      bankTransferEnabled: storeSettings.bankTransferEnabled || false,
      bankName: storeSettings.bankName || '',
      accountNumber: storeSettings.accountNumber || '',
      accountHolder: storeSettings.accountHolder || '',
      clabe: storeSettings.clabe || '',
      transferInstructions: storeSettings.transferInstructions || '',
      paymentInstructions: storeSettings.paymentInstructions || '',
      cashPaymentInstructions: storeSettings.cashPaymentInstructions || ''
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
