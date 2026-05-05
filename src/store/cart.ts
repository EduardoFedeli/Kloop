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
  isTurbinado: boolean
}

// Tiers de desconto da Sacolinha Turbinada — aplicados apenas aos itens turbinados
const TURBINADO_TIERS: { min: number; rate: number }[] = [
  { min: 5, rate: 0.30 },
  { min: 4, rate: 0.25 },
  { min: 3, rate: 0.20 },
  { min: 2, rate: 0.15 },
]

export type TurbinadoDiscount = {
  count: number        // nº de itens turbinados do vendedor na sacola
  rate: number         // taxa aplicada (ex: 0.15)
  savingsCents: number // economia em centavos
}

/**
 * Calcula o desconto Turbinar para um grupo de itens de um mesmo vendedor.
 * Retorna null se não houver itens turbinados suficientes (mínimo 2).
 */
export function calcTurbinadoDiscount(items: CartItem[]): TurbinadoDiscount | null {
  const turbinados = items.filter((i) => i.isTurbinado)
  if (turbinados.length < 2) return null

  const tier = TURBINADO_TIERS.find((t) => turbinados.length >= t.min)
  if (!tier) return null

  const subtotal = turbinados.reduce((s, i) => s + i.priceCents, 0)
  return {
    count: turbinados.length,
    rate: tier.rate,
    savingsCents: Math.round(subtotal * tier.rate),
  }
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
