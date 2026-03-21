import { ShoppingCart } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import { getRestaurantByUserId } from "../api/restaurants"
import { getCourierByUserId } from "../api/couriers"
import { useEffect, useMemo, useState } from "react"

type User = {
  id: number | string
  name?: string
  email?: string
  role?: "customer" | "restaurant" | "courier" | "admin"
  restaurantProfile?: any
  driverProfile?: any
  courierProfile?: any
}

export default function Navbar() {
  const navigate = useNavigate()

  const items = useCartStore((state) => state.items)
  const loadCart = useCartStore((state) => state.loadCart)
  const clearCart = useCartStore((state) => state.clearCart)

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user")
    return savedUser ? JSON.parse(savedUser) : null
  })

  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  useEffect(() => {
    loadCart()
  }, [loadCart, user?.id, user?.role])

  useEffect(() => {
    function syncUserFromStorage() {
      const savedUser = localStorage.getItem("user")
      setUser(savedUser ? JSON.parse(savedUser) : null)
      loadCart()
    }

    window.addEventListener("storage", syncUserFromStorage)
    window.addEventListener("focus", syncUserFromStorage)

    return () => {
      window.removeEventListener("storage", syncUserFromStorage)
      window.removeEventListener("focus", syncUserFromStorage)
    }
  }, [loadCart])

  const isLogged = !!user

  const restaurantProfile = user?.restaurantProfile || null
  const courierProfile = user?.courierProfile || user?.driverProfile || null

  const canAccessRestaurantPanel = !!restaurantProfile
  const canAccessDriverPanel = !!courierProfile

  function handleLogout() {
    clearCart()
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setUser(null)
    navigate("/login")
  }

  async function goToRestaurantPanel() {
    if (!isLogged || !user) {
      navigate("/login")
      return
    }

    try {
      const restaurant = await getRestaurantByUserId(Number(user.id))

      const updatedUser = {
        ...user,
        restaurantProfile: restaurant,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      navigate("/restaurant/dashboard")
    } catch (err) {
      console.error("Usuário sem restaurante vinculado:", err)
      navigate("/restaurant/register")
    }
  }

  async function goToDriverPanel() {
    if (!isLogged || !user) {
      navigate("/login")
      return
    }

    try {
      const courier = await getCourierByUserId(Number(user.id))

      const updatedUser = {
        ...user,
        courierProfile: courier,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      navigate("/driver/dashboard")
    } catch (err) {
      console.error("Usuário sem entregador vinculado:", err)
      navigate("/driver/register")
    }
  }

  function goToMyOrders() {
    if (!isLogged) {
      navigate("/login")
      return
    }

    navigate("/meus-pedidos")
  }

  function goToRestaurantRegister() {
    if (!isLogged) {
      navigate("/login")
      return
    }

    navigate("/restaurant/register")
  }

  async function goToDriverRegister() {
    if (!isLogged || !user) {
      navigate("/login")
      return
    }

    try {
      const courier = await getCourierByUserId(Number(user.id))

      const updatedUser = {
        ...user,
        courierProfile: courier,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      navigate("/driver/dashboard")
    } catch (err) {
      navigate("/driver/register")
    }
  }

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <h1
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-red-500 cursor-pointer"
          >
            Menu Express
          </h1>

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative md:hidden"
          >
            <ShoppingCart size={28} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar restaurantes ou pratos..."
          className="border rounded-lg px-4 py-2 w-full md:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Home
          </button>

          <button
            type="button"
            onClick={goToRestaurantPanel}
            className={`px-3 py-2 rounded-lg ${
              canAccessRestaurantPanel
                ? "hover:bg-gray-100"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Restaurante
          </button>

          <button
            type="button"
            onClick={goToDriverPanel}
            className={`px-3 py-2 rounded-lg ${
              canAccessDriverPanel
                ? "hover:bg-gray-100"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            Entregador
          </button>

          {!canAccessRestaurantPanel && (
            <button
              type="button"
              onClick={goToRestaurantRegister}
              className="px-3 py-2 hover:bg-gray-100 rounded"
            >
              Sou Restaurante
            </button>
          )}

          {!canAccessDriverPanel && (
            <button
              type="button"
              onClick={goToDriverRegister}
              className="px-3 py-2 hover:bg-gray-100 rounded"
            >
              Sou Entregador
            </button>
          )}

          {isLogged && (
            <button
              type="button"
              onClick={goToMyOrders}
              className="px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Meus pedidos
            </button>
          )}

          {!isLogged ? (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Entrar
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Criar conta
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
            >
              Sair
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative hidden md:block"
          >
            <ShoppingCart size={28} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}