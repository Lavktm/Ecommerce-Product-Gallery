import { create } from 'zustand'
import { CartItem, FlyToCartPayload, Product } from './types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  incrementItem: (productId: string) => void
  decrementItem: (productId: string) => void
  cartCount: number
  totalPrice: number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartCount: 0,
  totalPrice: 0,

  addItem: (product: Product) => {
    const { items } = get()
    const existing = items.find((i) => i.product.id === product.id)

    let newItems: CartItem[]
    if (existing) {
      newItems = items.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
      )
    } else {
      newItems = [...items, { product, quantity: 1 }]
    }

    set({
      items: newItems,
      cartCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: newItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    })
  },

  removeItem: (productId: string) => {
    const { items } = get()
    const newItems = items.filter((i) => i.product.id !== productId)
    set({
      items: newItems,
      cartCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: newItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    })
  },

  incrementItem: (productId: string) => {
    const { items } = get()
    const newItems = items.map((i) =>
      i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
    )
    set({
      items: newItems,
      cartCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: newItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    })
  },

  decrementItem: (productId: string) => {
    const { items } = get()
    const newItems = items
      .map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i,
      )
      .filter((i) => i.quantity > 0)
    set({
      items: newItems,
      cartCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: newItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    })
  },
}))

// ─── Fly-to-Cart Trigger Store ──────────────────────────────────

interface FlyState {
  payload: FlyToCartPayload | null
  cartIconPosition: { x: number; y: number } | null
  trigger: (payload: FlyToCartPayload) => void
  clear: () => void
  setCartIconPosition: (pos: { x: number; y: number }) => void
}

export const useFlyStore = create<FlyState>((set) => ({
  payload: null,
  cartIconPosition: null,
  trigger: (payload) => set({ payload }),
  clear: () => set({ payload: null }),
  setCartIconPosition: (pos) => set({ cartIconPosition: pos }),
}))
