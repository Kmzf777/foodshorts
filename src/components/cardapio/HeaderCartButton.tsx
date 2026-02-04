'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/button'

interface HeaderCartButtonProps {
    slug: string
}

export function HeaderCartButton({ slug }: HeaderCartButtonProps) {
    const { getItemCount } = useCartStore()
    const itemCount = getItemCount()

    if (itemCount === 0) return null

    return (
        <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href={`/cardapio/${slug}/pedido`} className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="font-medium">Ver Pedido ({itemCount})</span>
            </Link>
        </Button>
    )
}
