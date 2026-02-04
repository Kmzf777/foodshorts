import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, OrderOrigin } from '@/types'

interface CartState {
  // Contexto
  restaurantSlug: string | null
  origin: OrderOrigin | null
  tableNumber: number | null

  // Itens
  items: CartItem[]

  // Actions
  initializeCart: (slug: string, origin: OrderOrigin, tableNumber?: number) => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateNotes: (productId: string, notes: string) => void
  clearCart: () => void

  // Computed
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantSlug: null,
      origin: null,
      tableNumber: null,
      items: [],

      initializeCart: (slug, origin, tableNumber) => {
        const current = get()
        // Se mudar de restaurante, limpa o carrinho
        if (current.restaurantSlug && current.restaurantSlug !== slug) {
          set({ items: [] })
        }
        set({
          restaurantSlug: slug,
          origin,
          tableNumber: origin === 'table' ? tableNumber : null,
        })
      },

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }))
      },

      updateNotes: (productId, notes) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, notes } : i
          ),
        }))
      },

      clearCart: () => {
        set({ items: [], tableNumber: null })
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'foodshorts-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        restaurantSlug: state.restaurantSlug,
        origin: state.origin,
        tableNumber: state.tableNumber,
        items: state.items,
      }),
    }
  )
)
