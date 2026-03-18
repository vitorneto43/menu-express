import { create } from "zustand"

type CartItem = {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  restaurantId: number | null
  loadCart: () => void
  saveCart: (items: CartItem[], restaurantId: number | null) => void
  addItem: (item: Omit<CartItem, "quantity">, restaurantId: number) => void
  removeItem: (id: number) => void
  increaseQuantity: (id: number) => void
  decreaseQuantity: (id: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

function getCartStorageKey() {
  const savedUser = localStorage.getItem("user")
  if (!savedUser) return null

  const user = JSON.parse(savedUser)

  if (user.role !== "customer") {
    return null
  }

  return `menu-express-cart-customer-${user.id}`
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,

  loadCart: () => {
    const key = getCartStorageKey()

    if (!key) {
      set({ items: [], restaurantId: null })
      return
    }

    const saved = localStorage.getItem(key)

    if (!saved) {
      set({ items: [], restaurantId: null })
      return
    }

    try {
      const parsed = JSON.parse(saved)
      set({
        items: parsed.items || [],
        restaurantId: parsed.restaurantId || null,
      })
    } catch {
      set({ items: [], restaurantId: null })
    }
  },

  saveCart: (items, restaurantId) => {
    const key = getCartStorageKey()

    if (!key) return

    localStorage.setItem(
      key,
      JSON.stringify({
        items,
        restaurantId,
      })
    )
  },

  addItem: (item, restaurantId) =>
    set((state) => {
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        alert("Você só pode adicionar itens de um restaurante por vez.")
        return state
      }

      const existingItem = state.items.find((i) => i.id === item.id)

      let updatedItems: CartItem[]

      if (existingItem) {
        updatedItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      } else {
        updatedItems = [...state.items, { ...item, quantity: 1 }]
      }

      get().saveCart(updatedItems, restaurantId)

      return {
        ...state,
        restaurantId,
        items: updatedItems,
      }
    }),

  removeItem: (id) =>
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id)
      const updatedRestaurantId =
        updatedItems.length === 0 ? null : state.restaurantId

      get().saveCart(updatedItems, updatedRestaurantId)

      return {
        items: updatedItems,
        restaurantId: updatedRestaurantId,
      }
    }),

  increaseQuantity: (id) =>
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )

      get().saveCart(updatedItems, state.restaurantId)

      return {
        ...state,
        items: updatedItems,
      }
    }),

  decreaseQuantity: (id) =>
    set((state) => {
      const updatedItems = state.items
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)

      const updatedRestaurantId =
        updatedItems.length === 0 ? null : state.restaurantId

      get().saveCart(updatedItems, updatedRestaurantId)

      return {
        items: updatedItems,
        restaurantId: updatedRestaurantId,
      }
    }),

  clearCart: () => {
    get().saveCart([], null)
    set({ items: [], restaurantId: null })
  },

  totalItems: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),

  totalPrice: () =>
    get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}))