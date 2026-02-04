import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CardapioClient } from './cardapio-client'
import type { Product, Category, Restaurant } from '@/types'

interface CardapioPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ mesa?: string }>
}

export default async function CardapioPage({ params, searchParams }: CardapioPageProps) {
  const { slug } = await params
  const { mesa } = await searchParams
  const supabase = await createClient()

  // Buscar restaurante
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    // .eq('plan_status', 'active') // Allow inactive for now to debug or permanently depending on reqs
    .single()

  if (!restaurant) {
    notFound()
  }

  // Validar mesa se fornecida
  const tableNumber = mesa ? parseInt(mesa, 10) : null
  if (tableNumber && (tableNumber < 1 || tableNumber > restaurant.tables_count)) {
    notFound()
  }

  // Buscar produtos ativos
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('restaurant_id', restaurant.id)
    .eq('is_active', true)
    .order('sort_order')

  // Buscar categorias
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('is_active', true)
    .order('sort_order')

  return (
    <CardapioClient
      restaurant={restaurant as Restaurant}
      products={(products as Product[]) || []}
      categories={(categories as Category[]) || []}
      tableNumber={tableNumber}
    />
  )
}
