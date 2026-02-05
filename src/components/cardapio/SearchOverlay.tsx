'use client'

import { useState, useMemo } from 'react'
import { Search, X, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SearchProductCard } from './SearchProductCard'
import type { Product, Category } from '@/types'

interface SearchOverlayProps {
    products: Product[]
    categories: Category[]
    onClose: () => void
}

export function SearchOverlay({ products, categories, onClose }: SearchOverlayProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = activeCategory ? product.category_id === activeCategory : true

            return matchesSearch && matchesCategory
        })
    }, [products, searchQuery, activeCategory])

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center gap-3 mb-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="-ml-2">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar produtos..."
                            className="pl-9 bg-muted/50"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={cn(
                            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
                            activeCategory === null
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:bg-muted'
                        )}
                    >
                        Todos
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
                                activeCategory === category.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                            )}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <SearchProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Search className="h-12 w-12 mb-2 opacity-20" />
                        <p>Nenhum produto encontrado</p>
                    </div>
                )}
            </div>
        </div>
    )
}
