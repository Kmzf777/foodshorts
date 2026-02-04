'use client'

import { useEffect, useState, useMemo } from 'react'
import { useCartStore } from '@/stores/cartStore'
import { VideoFeed } from '@/components/cardapio/VideoFeed'
import { CategoryTabs } from '@/components/cardapio/CategoryTabs'
import { HeaderCartButton } from '@/components/cardapio/HeaderCartButton'
import type { Product, Category, Restaurant, OrderOrigin } from '@/types'

interface CardapioClientProps {
  restaurant: Restaurant
  products: Product[]
  categories: Category[]
  tableNumber: number | null
}

export function CardapioClient({
  restaurant,
  products,
  categories,
  tableNumber,
}: CardapioClientProps) {
  const { initializeCart, getItemCount } = useCartStore()
  const [activeTab, setActiveTab] = useState<string>('recommended')
  const itemCount = getItemCount()

  // Inicializar carrinho com origem correta
  useEffect(() => {
    const origin: OrderOrigin = tableNumber ? 'table' : 'delivery'
    initializeCart(restaurant.slug, origin, tableNumber || undefined)
  }, [restaurant.slug, tableNumber, initializeCart])

  // Filtrar produtos baseado na tab ativa
  const filteredProducts = useMemo(() => {
    if (activeTab === 'recommended') {
      return products.filter((p) => p.is_recommended)
    }
    if (activeTab === 'categories') {
      return products
    }
    // Filtrar por categoria específica
    return products.filter((p) => p.category_id === activeTab)
  }, [products, activeTab])

  // Se não há recomendados, mostrar todos
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products

  return (
    <div className="relative h-[100dvh] w-full bg-black overflow-x-hidden">
      {/* Header com logo e tabs */}
      <div className="absolute top-0 left-0 right-0 z-40 safe-area-inset-top">
        <div className="p-4">
          {/* Logo / Nome do restaurante */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {restaurant.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-white font-bold">{restaurant.name}</h1>
                {tableNumber && (
                  <p className="text-white/60 text-sm">Mesa {tableNumber}</p>
                )}
              </div>
            </div>

            {/* Cart Button in Header */}
            <HeaderCartButton slug={restaurant.slug} />
          </div>

          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            cartCount={itemCount}
          />
        </div>
      </div>

      {/* Video Feed */}
      {displayProducts.length > 0 ? (
        <VideoFeed products={displayProducts} />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <p>Nenhum produto disponivel</p>
        </div>
      )}
    </div>
  )
}
