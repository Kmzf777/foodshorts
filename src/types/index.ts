export type OrderOrigin = 'table' | 'delivery'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'canceled'
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix'
export type SubscriptionPlan = 'monthly' | 'annual'
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'pending'

export interface Restaurant {
  id: string
  owner_id: string
  name: string
  slug: string
  logo_url: string | null
  tables_count: number
  delivery_enabled: boolean
  plan: SubscriptionPlan
  plan_status: SubscriptionStatus
  plan_expires_at: string | null
  abacatepay_customer_id: string | null
  abacatepay_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  restaurant_id: string
  name: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  restaurant_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  video_url: string
  video_thumbnail_url: string | null
  video_duration: number | null
  is_recommended: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Customer {
  id: string
  user_id: string | null
  name: string
  phone: string | null
  email: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_zipcode: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  restaurant_id: string
  customer_id: string | null
  order_number: number
  origin: OrderOrigin
  table_number: number | null
  customer_name: string | null
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  payment_method: PaymentMethod | null
  created_at: string
  confirmed_at: string | null
  completed_at: string | null
  items?: OrderItem[]
  customer?: Customer
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  notes: string | null
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export interface CartState {
  restaurantSlug: string | null
  origin: OrderOrigin | null
  tableNumber: number | null
  items: CartItem[]
}
