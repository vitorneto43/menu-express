import { useEffect, useState } from "react"
import api from "../api/client"
import Navbar from "../components/Navbar"
import { useCartStore } from "../store/cartStore"
import { getRestaurantPromotions } from "../api/promotions"
import type { Promotion } from "../api/promotions"

type Product = {
  id: number
  name: string
  description?: string
  price: number | string
  image?: string | null
}

type Restaurant = {
  id: number
  name: string
  products: Product[]
  promotions?: Promotion[]
}

export default function ClientMenu() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await api.get("/restaurants")
        const restaurantsData: Restaurant[] = Array.isArray(response.data)
          ? response.data
          : []

        const restaurantsWithPromotions = await Promise.all(
          restaurantsData.map(async (restaurant) => {
            try {
              const promotions = await getRestaurantPromotions(restaurant.id)
              console.log("RESTAURANTE:", restaurant.id, restaurant.name)
              console.log("PROMOÇÕES BRUTAS:", promotions)
              console.log("RESTAURANTS FINAL:", restaurants)

              return {
                ...restaurant,
                promotions: Array.isArray(promotions) ? promotions : [],
              }
            } catch (error) {
              console.error(
                `Erro ao buscar promoções do restaurante ${restaurant.id}:`,
                error
              )

              return {
                ...restaurant,
                promotions: [],
              }
            }
          })
        )

        setRestaurants(restaurantsWithPromotions)
      } catch (error) {
        console.error("Erro ao buscar restaurantes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  if (loading) {
    return <div className="p-6">Carregando cardápio...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Restaurantes</h1>

        <div className="space-y-8">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6">{restaurant.name}</h2>

              {restaurant.promotions && restaurant.promotions.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-red-500 mb-4">
                    Promoções
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {restaurant.promotions.map((promo) => (
                      <div
                        key={promo.id}
                        className="border-2 border-red-200 rounded-2xl p-4 flex flex-col justify-between bg-red-50"
                      >
                        <div>
                          <img
                            src={
                              promo.banner_url ||
                              "https://via.placeholder.com/300x200?text=Promocao"
                            }
                            alt={promo.title}
                            className="w-full h-40 object-cover rounded-xl mb-3"
                          />

                          <h4 className="text-lg font-bold">{promo.title}</h4>

                          <p className="text-gray-500 text-sm mb-2">
                            {promo.description || "Promoção especial"}
                          </p>

                          {promo.product_name && (
                            <p className="text-sm text-gray-600 mb-2">
                              Produto: {promo.product_name}
                            </p>
                          )}

                          <p className="text-red-600 font-bold text-xl">
                            R${" "}
                            {Number(
                              String(promo.promotional_price || 0).replace(",", ".")
                            ).toFixed(2)}
                          </p>
                        </div>

                        {promo.product_id && (
                          <button
                            onClick={() =>
                              addItem(
                                {
                                  id: promo.product_id as number,
                                  name: promo.product_name || promo.title,
                                  price: Number(
                                    String(promo.promotional_price || 0).replace(",", ".")
                                  ),
                                  image: promo.banner_url || "",
                                },
                                restaurant.id
                              )
                            }
                            className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold transition"
                          >
                            Adicionar promoção ao carrinho
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold mb-4">Cardápio</h3>

              {restaurant.products?.length === 0 ? (
                <p className="text-gray-500">Nenhum produto disponível.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurant.products?.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <img
                          src={
                            product.image ||
                            "https://via.placeholder.com/300x200?text=Produto"
                          }
                          alt={product.name}
                          className="w-full h-40 object-cover rounded-xl mb-3"
                        />

                        <h3 className="text-lg font-bold">{product.name}</h3>
                        <p className="text-gray-500 text-sm mb-2">
                          {product.description || "Sem descrição"}
                        </p>
                        <p className="text-red-500 font-semibold text-lg">
                          R${" "}
                          {Number(String(product.price).replace(",", ".")).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          addItem(
                            {
                              id: product.id,
                              name: product.name,
                              price: Number(String(product.price).replace(",", ".")),
                              image: product.image || "",
                            },
                            restaurant.id
                          )
                        }
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold transition"
                      >
                        Adicionar ao carrinho
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}