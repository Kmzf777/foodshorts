export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          logo_url: string | null
          tables_count: number
          delivery_enabled: boolean
          plan: 'monthly' | 'annual'
          plan_status: 'active' | 'canceled' | 'expired' | 'pending'
          plan_expires_at: string | null
          abacatepay_customer_id: string | null
          abacatepay_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          logo_url?: string | null
          tables_count?: number
          delivery_enabled?: boolean
          plan?: 'monthly' | 'annual'
          plan_status?: 'active' | 'canceled' | 'expired' | 'pending'
          plan_expires_at?: string | null
          abacatepay_customer_id?: string | null
          abacatepay_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          tables_count?: number
          delivery_enabled?: boolean
          plan?: 'monthly' | 'annual'
          plan_status?: 'active' | 'canceled' | 'expired' | 'pending'
          plan_expires_at?: string | null
          abacatepay_customer_id?: string | null
          abacatepay_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
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
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          video_url: string
          video_thumbnail_url?: string | null
          video_duration?: number | null
          is_recommended?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          video_url?: string
          video_thumbnail_url?: string | null
          video_duration?: number | null
          is_recommended?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
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
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          phone?: string | null
          email?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zipcode?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          phone?: string | null
          email?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zipcode?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          customer_id: string | null
          order_number: number
          origin: 'table' | 'delivery'
          table_number: number | null
          customer_name: string | null
          subtotal: number
          delivery_fee: number
          total: number
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'canceled'
          payment_method: 'cash' | 'credit' | 'debit' | 'pix' | null
          created_at: string
          confirmed_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          restaurant_id: string
          customer_id?: string | null
          order_number?: number
          origin: 'table' | 'delivery'
          table_number?: number | null
          customer_name?: string | null
          subtotal: number
          delivery_fee?: number
          total: number
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'canceled'
          payment_method?: 'cash' | 'credit' | 'debit' | 'pix' | null
          created_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          restaurant_id?: string
          customer_id?: string | null
          order_number?: number
          origin?: 'table' | 'delivery'
          table_number?: number | null
          customer_name?: string | null
          subtotal?: number
          delivery_fee?: number
          total?: number
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'canceled'
          payment_method?: 'cash' | 'credit' | 'debit' | 'pix' | null
          created_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          subtotal: number
          notes: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          subtotal: number
          notes?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          subtotal?: number
          notes?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          restaurant_id: string
          abacatepay_payment_id: string
          amount: number
          status: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          abacatepay_payment_id: string
          amount: number
          status: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          abacatepay_payment_id?: string
          amount?: number
          status?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_plan: 'monthly' | 'annual'
      subscription_status: 'active' | 'canceled' | 'expired' | 'pending'
      order_origin: 'table' | 'delivery'
      order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'canceled'
      payment_method: 'cash' | 'credit' | 'debit' | 'pix'
    }
  }
}
