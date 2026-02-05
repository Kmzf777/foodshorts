import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CustomerData {
  id: string
  name: string
  cpf: string
  phone: string
  whatsapp: string
  email?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
  }
}

interface CustomerAuthState {
  customer: CustomerData | null
  isAuthenticated: boolean
  hasHydrated: boolean

  // Actions
  login: (customer: CustomerData) => void
  logout: () => void
  updateCustomer: (data: Partial<CustomerData>) => void
  setHasHydrated: (state: boolean) => void
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,
      hasHydrated: false,

      login: (customer) => {
        set({ customer, isAuthenticated: true })
      },

      logout: () => {
        set({ customer: null, isAuthenticated: false })
      },

      updateCustomer: (data) => {
        set((state) => ({
          customer: state.customer ? { ...state.customer, ...data } : null,
        }))
      },

      setHasHydrated: (state) => {
        set({ hasHydrated: state })
      },
    }),
    {
      name: 'foodshorts-customer-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
