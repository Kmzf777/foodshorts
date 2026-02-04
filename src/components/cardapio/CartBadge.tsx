'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'

interface CartBadgeProps {
  slug: string
}

export function CartBadge({ slug }: CartBadgeProps) {
  const { items, getTotal, getItemCount } = useCartStore()
  const itemCount = getItemCount()
  const total = getTotal()

  if (itemCount === 0) return null

  return (
    <Link
      href={`/cardapio/${slug}/pedido`}
      className="fixed bottom-6 left-4 right-4 bg-primary text-primary-foreground rounded-full py-4 px-6 flex items-center justify-between shadow-lg safe-area-inset-bottom z-50"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-white text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
            {itemCount}
          </span>
        </div>
        <span className="font-medium">Ver Pedido</span>
      </div>
      <span className="font-bold">{formatCurrency(total)}</span>
    </Link>
  )
}
