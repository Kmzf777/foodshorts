'use client'

import { Star, Grid, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

type TabType = 'recommended' | 'categories' | 'cart'

interface CategoryTabsProps {
  categories: Category[]
  activeTab: TabType | string
  onTabChange: (tab: TabType | string) => void
  cartCount: number
}

export function CategoryTabs({
  categories,
  activeTab,
  onTabChange,
  cartCount,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {/* Recomendados */}
      <button
        onClick={() => onTabChange('recommended')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          activeTab === 'recommended'
            ? 'bg-primary text-primary-foreground'
            : 'bg-white/20 text-white hover:bg-white/30'
        )}
      >
        <Star className="h-4 w-4" />
        Recomendados
      </button>

      {/* Todas Categorias */}
      <button
        onClick={() => onTabChange('categories')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          activeTab === 'categories'
            ? 'bg-primary text-primary-foreground'
            : 'bg-white/20 text-white hover:bg-white/30'
        )}
      >
        <Grid className="h-4 w-4" />
        Todos
      </button>

      {/* Individual Categories */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onTabChange(category.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            activeTab === category.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-white/20 text-white hover:bg-white/30'
          )}
        >
          {category.name}
        </button>
      ))}

      {/* Cart */}
      <button
        onClick={() => onTabChange('cart')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          activeTab === 'cart'
            ? 'bg-primary text-primary-foreground'
            : 'bg-white/20 text-white hover:bg-white/30'
        )}
      >
        <ShoppingBag className="h-4 w-4" />
        Pedido
        {cartCount > 0 && (
          <span className="bg-white text-primary rounded-full px-2 py-0.5 text-xs font-bold">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  )
}
