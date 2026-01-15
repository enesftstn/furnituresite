"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  quantity: number
  stock_quantity: number
  variantId?: string | null
  variantName?: string | null
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: string, variantId?: string | null) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  getCartTotal: () => number
  getItemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && (i.variantId || null) === (item.variantId || null),
          )

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && (i.variantId || null) === (item.variantId || null)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            }
          }

          return { items: [...state.items, { ...item, quantity }] }
        })
      },
      removeItem: (productId, variantId = null) => {
        set((state) => ({
          items: state.items.filter((item) => !(item.id === productId && (item.variantId || null) === variantId)),
        }))
      },
      updateQuantity: (productId, quantity, variantId = null) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId && (item.variantId || null) === variantId ? { ...item, quantity } : item,
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
