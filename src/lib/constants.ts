export const APP_NAME = 'FoodShorts'
export const APP_DESCRIPTION = 'Cardápio digital interativo com vídeos curtos'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CADASTRO: '/cadastro',
  PRICING: '/pricing',
  CHECKOUT: '/checkout',
  DASHBOARD: '/dashboard',
  PEDIDOS: '/pedidos',
  CARDAPIO: '/cardapio',
  CONTA: '/conta',
} as const

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELED: 'canceled',
} as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  canceled: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  canceled: 'bg-red-100 text-red-800',
}

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT: 'credit',
  DEBIT: 'debit',
  PIX: 'pix',
} as const

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  pix: 'PIX',
}

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Mensal',
    price: 49.90,
    priceInCents: 4990,
    description: 'Cobrança mensal',
  },
  ANNUAL: {
    id: 'annual',
    name: 'Anual',
    price: 358.80,
    priceInCents: 35880,
    monthlyPrice: 29.90,
    description: 'Economize R$ 240/ano',
    discount: '40%',
  },
} as const

export const VIDEO_CONSTRAINTS = {
  MAX_DURATION: 15, // segundos
  ASPECT_RATIO: 9 / 16,
  WIDTH: 1080,
  HEIGHT: 1920,
  MAX_SIZE_MB: 50,
} as const
