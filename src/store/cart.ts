import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  listingId: string
  slug: string
  title: string
  priceCents: number
  imageUrl: string | null
  sellerId: string
  sellerName: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (listingId: string) => void
  clearSeller: (sellerId: string) => void
  clearAll: () => void
  hasItem: (listingId: string) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const exists = get().items.some((i) => i.listingId === item.listingId)
        if (!exists) {
          set((s) => ({ items: [...s.items, item] }))
        }
      },

      removeItem: (listingId) => {
        set((s) => ({ items: s.items.filter((i) => i.listingId !== listingId) }))
      },

      clearSeller: (sellerId) => {
        set((s) => ({ items: s.items.filter((i) => i.sellerId !== sellerId) }))
      },

      clearAll: () => set({ items: [] }),

      hasItem: (listingId) => get().items.some((i) => i.listingId === listingId),
    }),
    { name: 'kloop-cart' }
  )
)
