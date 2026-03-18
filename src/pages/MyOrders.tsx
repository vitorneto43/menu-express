import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import api from "../api/client"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

type Address = {
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  cep?: string
  complement?: string
  reference?: string
  latitude?: number | null
  longitude?: number | null
}

type Order = {
  id: number
  order_number?: string
  restaurant_id: number
  restaurant_name?: string
  total: number
  status: string
  created_at: string
  estimated_preparation_minutes?: number
  estimated_delivery_minutes?: number
  estimated_total_minutes?: number
  driver_latitude?: number | null
  driver_longitude?: number | null
  restaurant_address?: Address | null
  delivery_address?: Address | null
}

const statusLabels: Record<string, string> = {
  pending: "Pedido recebido",
  accepted: "Pedido confirmado",
  preparing: "Em preparo",
  ready: "Pronto para entrega",
  picked_up: "Pedido com o entregador",
  on_the_way: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
}

const statusStep: Record<string, number> = {
  pending: 1,
  accepted: 2,
  preparing: 3,
  ready: 4,
  picked_up: 5,
  on_the_way: 6,
  delivered: 7,
  cancelled: 0,
}

function formatAddress(address?: Address | null) {
  if (!address) return "Endereço não informado"

  const line1 = [address.street, address.number].filter(Boolean).join(", ")
  const line2 = [address.neighborhood, address.city, address.state]
    .filter(Boolean)
    .join(" - ")

  return [line1, line2].filter(Boolean).join(" • ") || "Endereço não informado"
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700"
    case "accepted":
      return "bg-blue-50 text-blue-700"
    case "preparing":
      return "bg-orange-50 text-orange-700"
    case "ready":
      return "bg-purple-50 text-purple-700"
    case "picked_up":
      return "bg-indigo-50 text-indigo-700"
    case "on_the_way":
      return "bg-cyan-50 text-cyan-700"
    case "delivered":
      return "bg-green-50 text-green-700"
    case "cancelled":
      return "bg-red-50 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadOrders() {
      try {
        const savedUser = localStorage.getItem("user")

        if (!savedUser) {
          setError("Você precisa estar logado.")
          return
        }

        const user = JSON.parse(savedUser)
        const response = await api.get(`/orders/user/${user.id}`)
        setOrders(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error(err)
        setError("Erro ao carregar pedidos")
      }
    }

    loadOrders()

    const interval = setInterval(() => {
      loadOrders()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Meus pedidos</h1>

        {error && <p className="text-red-500">{error}</p>}

        {orders.length === 0 && !error ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const step = statusStep[order.status] || 1
              const progressWidth =
                order.status === "cancelled"
                  ? "0%"
                  : `${Math.min((step / 7) * 100, 100)}%`

              const restaurantLat = order.restaurant_address?.latitude
              const restaurantLng = order.restaurant_address?.longitude

              const deliveryLat = order.delivery_address?.latitude
              const deliveryLng = order.delivery_address?.longitude

              const hasRestaurantLocation =
                restaurantLat !== null &&
                restaurantLat !== undefined &&
                restaurantLng !== null &&
                restaurantLng !== undefined

              const hasDriverLocation =
                order.driver_latitude !== null &&
                order.driver_latitude !== undefined &&
                order.driver_longitude !== null &&
                order.driver_longitude !== undefined

              const hasDeliveryLocation =
                deliveryLat !== null &&
                deliveryLat !== undefined &&
                deliveryLng !== null &&
                deliveryLng !== undefined

              const mapCenter: [number, number] = hasDriverLocation
                ? [Number(order.driver_latitude), Number(order.driver_longitude)]
                : hasDeliveryLocation
                ? [Number(deliveryLat), Number(deliveryLng)]
                : hasRestaurantLocation
                ? [Number(restaurantLat), Number(restaurantLng)]
                : [-8.118055, -34.894444]

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-lg">
                        Pedido{" "}
                        {order.order_number ||
                          `ME-${String(order.id).padStart(5, "0")}`}
                      </p>
                      <p className="text-gray-500">
                        {order.restaurant_name ||
                          `Restaurante #${order.restaurant_id}`}
                      </p>
                    </div>

                    <p className="font-bold text-red-500 text-lg">
                      R$ {Number(order.total || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <span
                      className={`inline-block px-4 py-2 rounded-full font-medium ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {statusLabels[order.status] || "Status atualizado"}
                    </span>

                    <span className="inline-block bg-red-50 text-red-600 px-4 py-2 rounded-full font-medium">
                      Tempo estimado: {order.estimated_total_minutes || 25} min
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          order.status === "cancelled"
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: progressWidth }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Recebido</span>
                      <span>Preparo</span>
                      <span>Entrega</span>
                      <span>Finalizado</span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-600 space-y-1">
                    <p>
                      Preparo estimado:{" "}
                      {order.estimated_preparation_minutes || 25} min
                    </p>
                    <p>
                      Entrega estimada:{" "}
                      {order.estimated_delivery_minutes || 0} min
                    </p>
                    <p>
                      📍 Restaurante: {formatAddress(order.restaurant_address)}
                    </p>
                    <p>
                      🏠 Entrega: {formatAddress(order.delivery_address)}
                    </p>
                  </div>

                  {(hasRestaurantLocation ||
                    hasDriverLocation ||
                    hasDeliveryLocation) && (
                    <div className="mt-5 rounded-2xl overflow-hidden">
                      <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ height: "300px", width: "100%" }}
                      >
                        <TileLayer
                          attribution="&copy; OpenStreetMap contributors"
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {hasRestaurantLocation && (
                          <Marker
                            position={[
                              Number(restaurantLat),
                              Number(restaurantLng),
                            ]}
                          >
                            <Popup>
                              🍔 {order.restaurant_name || "Restaurante"}
                            </Popup>
                          </Marker>
                        )}

                        {hasDriverLocation && (
                          <Marker
                            position={[
                              Number(order.driver_latitude),
                              Number(order.driver_longitude),
                            ]}
                          >
                            <Popup>🚴 Entregador a caminho</Popup>
                          </Marker>
                        )}

                        {hasDeliveryLocation && (
                          <Marker
                            position={[Number(deliveryLat), Number(deliveryLng)]}
                          >
                            <Popup>🏠 Seu endereço de entrega</Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    </div>
                  )}

                  <p className="text-sm text-gray-400 mt-4">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
