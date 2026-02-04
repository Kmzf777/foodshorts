'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/stores/cartStore'
import { toast } from 'sonner'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  // Props kept for compatibility but not used for description logic anymore
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, restaurantSlug } = useCartStore()
  const [showFullDescription, setShowFullDescription] = useState(false)

  function handleAddToCart() {
    if (!restaurantSlug) {
      toast.error('Erro ao adicionar produto')
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
    })

    toast.success('Adicionado ao pedido!', {
      description: product.name,
    })
  }

  return (
    <>
      <div className="absolute bottom-6 left-0 right-0 p-6 safe-area-inset-bottom">
        {/* Category Badge */}
        {product.category && (
          <Badge variant="secondary" className="mb-2">
            {product.category.name}
          </Badge>
        )}

        {product.is_recommended && (
          <Badge className="mb-2 ml-2 bg-primary">Recomendado</Badge>
        )}

        {/* Product Info */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white mb-1">{product.name}</h2>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(product.price)}
            </p>

            {/* Description */}
            {product.description && (
              <div
                className="mt-2 flex items-center gap-2 cursor-pointer group pr-4"
                onClick={() => setShowFullDescription(true)}
              >
                <p className="text-white/80 text-sm line-clamp-1 group-hover:text-white transition-colors">
                  {product.description}
                </p>
                <span className="text-xs font-bold text-white/90 underline whitespace-nowrap shrink-0">Ver mais</span>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="rounded-full h-14 w-14 flex-shrink-0"
            onClick={handleAddToCart}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Full Description Modal */}
      {showFullDescription && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setShowFullDescription(false)}
        >
          <div
            className="bg-background/95 p-6 rounded-lg max-w-sm w-full relative border border-border/50 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setShowFullDescription(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <h3 className="font-bold text-lg mb-2">{product.name}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap break-words">{product.description}</p>
          </div>
        </div>
      )}
    </>
  )
}
