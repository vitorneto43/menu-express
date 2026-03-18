import { useEffect } from "react"
import AppRouter from "./router"
import { useCartStore } from "./store/cartStore"



function App() {
  const loadCart = useCartStore((state) => state.loadCart)

  useEffect(() => {
    loadCart()
  }, [loadCart])

  return <AppRouter />
}

export default App