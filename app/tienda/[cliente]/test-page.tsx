'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function TestMenuPage() {
  const params = useParams()
  const clienteId = params.cliente as string
  
  const [loading, setLoading] = useState(true)
  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    console.log('🔄 Test component mounted for:', clienteId)
    
    // Simular carga de datos
    setTimeout(() => {
      console.log('✅ Setting test data')
      setStoreInfo({
        storeName: 'Nanixhe Chicken',
        storeActive: true
      })
      setCategories([
        {
          name: 'Bebidas',
          products: [
            { name: 'Café Americano', price: 35 }
          ]
        }
      ])
      setLoading(false)
    }, 2000)
  }, [clienteId])

  console.log('🔍 Test render state:', { loading, storeInfo: !!storeInfo, categories: categories.length })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando menú...</p>
          <p className="text-sm text-gray-500 mt-2">Test Debug: {JSON.stringify({ loading, storeInfo: !!storeInfo, categories: categories.length })}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">{storeInfo?.storeName}</h1>
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">{category.name}</h2>
            <div className="space-y-2">
              {category.products.map((product: any, productIndex: number) => (
                <div key={productIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{product.name}</span>
                  <span className="font-semibold">${product.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
