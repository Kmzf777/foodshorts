'use client'

import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/stores/cartStore'
import { toast } from 'sonner'
import type { Product } from '@/types'

interface SearchProductCardProps {
    product: Product
}

export function SearchProductCard({ product }: SearchProductCardProps) {
    const { addItem, restaurantSlug } = useCartStore()

    function handleAddToCart(e: React.MouseEvent) {
        e.stopPropagation()

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
        <div className="flex gap-4 p-4 bg-muted/30 rounded-lg mb-3">
            {/* Video Thumbnail (Left) */}
            <div className="relative w-24 h-32 flex-shrink-0 bg-black rounded-md overflow-hidden">
                {product.video_thumbnail_url ? (
                    <img
                        src={product.video_thumbnail_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-xs text-gray-500">Sem imagem</span>
                    </div>
                )}
            </div>

            {/* Details (Right) */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base line-clamp-2">{product.name}</h3>
                        {product.is_recommended && (
                            <Badge className="bg-primary text-[10px] h-5 px-1.5 shrink-0">Pop</Badge>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">
                        {product.description}
                    </p>

                    <div className="font-bold text-lg text-primary">
                        {formatCurrency(product.price)}
                    </div>
                </div>

                <Button
                    className="w-full mt-2"
                    size="sm"
                    onClick={handleAddToCart}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                </Button>
            </div>
        </div>
    )
}
