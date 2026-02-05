'use client'

import { Star, Grid, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

type TabType = 'recommended' | 'categories'

interface CategoryTabsProps {
  categories: Category[]
  activeTab: TabType | string
  onTabChange: (tab: TabType | string) => void
  onSearchClick: () => void
  cartCount: number // Kept for compatibility if needed, but not used in this component anymore for badge
}

export function CategoryTabs({
  categories,
  activeTab,
  onTabChange,
  onSearchClick,
  cartCount,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {/* Buscar */}
      <button
        onClick={onSearchClick}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-white/20 text-white hover:bg-white/30"
      >
        <Search className="h-4 w-4" />
        Buscar
      </button>

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
    </div>
  )
}
