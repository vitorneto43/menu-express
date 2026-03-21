import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import Navbar from "../components/Navbar"
import { getRestaurantById } from "../api/restaurants"

type Restaurant = {
  id: number
  name: string
  delivery_fee: number | string
}

export default function Cart() {
  const navigate = useNavigate()
  const {
    items,
    restaurantId,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    totalPrice,
    clearCart,
  } = useCartStore()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        if (!restaurantId) return
        const data = await getRestaurantById(restaurantId)
        setRestaurant(data)
      } catch (error) {
        console.error("Erro ao buscar restaurante:", error)
      }
    }

    fetchRestaurant()
  }, [restaurantId])

  const deliveryFee = Number(restaurant?.delivery_fee || 0)
  const subtotal = totalPrice()
  const total = subtotal + (items.length > 0 ? deliveryFee : 0)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Seu carrinho</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />

                    <div>
                      <h2 className="font-bold text-lg">{item.name}</h2>
                      <p className="text-red-500 font-semibold">
                        R$ {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="bg-gray-200 px-3 py-1 rounded-lg"
                    >
                      -
                    </button>

                    <span className="font-semibold">{item.quantity}</span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="bg-gray-200 px-3 py-1 rounded-lg"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 font-medium ml-3"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow p-6 h-fit">
              <h2 className="text-2xl font-bold mb-4">Resumo</h2>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Entrega</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold mt-6 transition"
              >
                Ir para pagamento
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-3 border border-gray-300 py-3 rounded-xl font-medium"
              >
                Limpar carrinho
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}