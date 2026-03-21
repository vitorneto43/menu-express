// src/context/CartContext.tsx
import { createContext, useContext, useState } from "react"

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | null>(null)

export const CartProvider = ({ children }: any) => {
  const [cart, setCart] = useState<CartItem[]>([])

  function addToCart(item: CartItem) {
    setCart(prev => {
      const exists = prev.find(p => p.id === item.id)

      if (exists) {
        return prev.map(p =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      }

      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(p => p.id !== id))
  }

  function clearCart() {
    setCart([])
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart fora do provider")
  return context
}