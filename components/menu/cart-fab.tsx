'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'

interface CartItem {
  product: {
    id: string
    name: string
    price: number
  }
  quantity: number
  totalPrice: number
}

interface CartFabProps {
  cart: CartItem[]
  onClick: () => void
}

export function CartFab({ cart, onClick }: CartFabProps) {
  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  }

  if (cart.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        onClick={onClick}
        className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 relative"
        size="lg"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {getCartItemsCount() > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-3 -right-3 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
            >
              {getCartItemsCount()}
            </Badge>
          )}
        </div>
      </Button>
      
      {/* Cart Summary Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 hidden lg:block">
        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm whitespace-nowrap">
          <div className="font-medium">{getCartItemsCount()} {getCartItemsCount() === 1 ? 'artículo' : 'artículos'}</div>
          <div className="text-primary-foreground/70">Total: ${getCartTotal().toFixed(2)}</div>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
        </div>
      </div>
    </div>
  )
}
