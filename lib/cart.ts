import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  stock_quantity: number
  sku?: string
  images?: any[]
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: CartProduct, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  cleanInvalidItems: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        if (!product || !product.id || !product.price) {
          console.error('Invalid product', product)
          return
        }
        
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id)
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity) }
                  : item
              ),
            }
          }
          
          return {
            items: [...state.items, { product, quantity: Math.min(quantity, product.stock_quantity) }],
          }
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: Math.min(quantity, item.product.stock_quantity) }
              : item
          ),
        }))
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      cleanInvalidItems: () => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.product && item.product.id && item.product.price !== undefined
          ),
        }))
      },
      
      getTotal: () => {
        const state = get()
        // Filter out invalid items and calculate total
        return state.items
          .filter((item) => item.product && item.product.price !== undefined)
          .reduce((total, item) => total + (item.product.price * item.quantity), 0)
      },
      
      getItemCount: () => {
        const state = get()
        // Filter out invalid items and count
        return state.items
          .filter((item) => item.product && item.product.id)
          .reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
