import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import { API_BASE_URL } from "../api/client"
import { getRestaurantById } from "../api/restaurants"
import { getProductsByRestaurant } from "../api/products"
import { getRestaurantPromotions } from "../api/promotions"
import type { Promotion } from "../api/promotions"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type Restaurant = {
  id: number
  name: string
  description?: string | null
  image?: string | null
  delivery_fee: number
  latitude?: number | null
  longitude?: number | null
  address?: {
    street?: string | null
    number?: string | null
    neighborhood?: string | null
    city?: string | null
    state?: string | null
    cep?: string | null
  } | null
}

type Product = {
  id: number
  restaurant_id: number
  name: string
  description?: string | null
  price: number
  image?: string | null
  available: boolean
}

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function formatAddress(restaurant: Restaurant) {
  const address = restaurant.address
  if (!address) return "Endereço não informado"

  const line1 = [address.street, address.number].filter(Boolean).join(", ")
  const line2 = [address.neighborhood, address.city, address.state]
    .filter(Boolean)
    .join(" - ")

  return [line1, line2].filter(Boolean).join(" • ") || "Endereço não informado"
}

function getProductImageUrl(image?: string | null) {
  if (!image) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
  }

  if (image.startsWith("http") || image.startsWith("blob:")) {
    return image
  }

  return `${API_BASE_URL}${image}`
}

function getRestaurantCoverUrl(image?: string | null) {
  if (!image) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
  }

  if (image.startsWith("http") || image.startsWith("blob:")) {
    return image
  }

  return image
}

export default function RestaurantDetail() {
  const { id } = useParams()
  const restaurantId = Number(id)
  const navigate = useNavigate()

  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        if (!id) return

        const [restaurantData, productsData, promotionsData] = await Promise.all([
          getRestaurantById(id),
          getProductsByRestaurant(restaurantId),
          getRestaurantPromotions(restaurantId),
        ])

        setRestaurant(restaurantData)
        setProducts(
          Array.isArray(productsData)
            ? productsData.filter((product) => product.available)
            : []
        )
        setPromotions(
          Array.isArray(promotionsData)
            ? promotionsData.filter((promo) => promo.active)
            : []
        )
      } catch (error) {
        console.error("Erro ao carregar restaurante:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, restaurantId])

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  if (!restaurant) {
    return <div className="p-6">Restaurante não encontrado.</div>
  }

  const hasLocation =
    restaurant.latitude !== null &&
    restaurant.latitude !== undefined &&
    restaurant.longitude !== null &&
    restaurant.longitude !== undefined

  const mapCenter: [number, number] = hasLocation
    ? [Number(restaurant.latitude), Number(restaurant.longitude)]
    : [-8.118055, -34.894444]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full h-64 overflow-hidden">
        <img
          src={getRestaurantCoverUrl(restaurant.image)}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>

              <p className="text-gray-500 mt-2">
                {restaurant.description || "Restaurante parceiro Menu Express"}
              </p>

              <p className="text-sm text-gray-700 mt-3 font-medium">
                📍 {formatAddress(restaurant)}
              </p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                  ⭐ 4.8
                </span>
                <span>Entrega</span>
                <span>Taxa R$ {Number(restaurant.delivery_fee).toFixed(2)}</span>
                <span>Tempo estimado 25-45 min</span>
                <span className="text-green-600 font-medium">Aberto agora</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/cart")}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              Ver carrinho ({totalItems})
            </button>
          </div>
        </div>

        {hasLocation && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Localização do restaurante
            </h2>

            <div className="rounded-2xl overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ height: "320px", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={mapCenter} icon={customIcon}>
                  <Popup>
                    <div>
                      <p className="font-bold">{restaurant.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatAddress(restaurant)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {promotions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Promoções</h2>

            <div className="grid grid-cols-1 gap-4">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl shadow p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                >
                  <div className="flex gap-4">
                    <img
                      src={getProductImageUrl(promo.banner_url)}
                      alt={promo.title}
                      className="w-28 h-28 rounded-xl object-cover"
                    />

                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {promo.title}
                      </h3>

                      <p className="text-gray-500 mt-2 max-w-xl">
                        {promo.description || "Promoção especial"}
                      </p>

                      {promo.product_name && (
                        <p className="text-sm text-gray-600 mt-2">
                          Produto: {promo.product_name}
                        </p>
                      )}

                      <p className="text-red-600 font-bold mt-3 text-xl">
                        R$ {Number(promo.promotional_price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {promo.product_id ? (
                    <button
                      onClick={() => {
                        addItem(
                          {
                            id: promo.product_id as number,
                            name: promo.product_name || promo.title,
                            price: Number(promo.promotional_price || 0),
                            image: getProductImageUrl(promo.banner_url),
                          },
                          restaurant.id
                        )
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition"
                    >
                      Adicionar promoção
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-600 px-4 py-2 rounded-xl font-medium cursor-not-allowed"
                    >
                      Promoção sem produto vinculado
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cardápio</h2>

          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
              >
                <div className="flex gap-4">
                  <img
                    src={getProductImageUrl(product.image)}
                    alt={product.name}
                    className="w-28 h-28 rounded-xl object-cover"
                  />

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 mt-2 max-w-xl">
                      {product.description || "Sem descrição"}
                    </p>
                    <p className="text-red-500 font-bold mt-3">
                      R$ {Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addItem(
                      {
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        image: getProductImageUrl(product.image),
                      },
                      restaurant.id
                    )
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}