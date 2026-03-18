import { useEffect, useMemo, useState } from "react"
import Navbar from "../components/Navbar"
import Categories from "../components/Categories"
import HeroBanner from "../components/HeroBanner"
import RestaurantCard from "../components/RestaurantCard"
import { getRestaurants } from "../api/restaurants"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

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

function formatAddress(restaurant: Restaurant) {
  const address = restaurant.address
  if (!address) return "Endereço não informado"

  const line1 = [address.street, address.number].filter(Boolean).join(", ")
  const line2 = [address.neighborhood, address.city, address.state]
    .filter(Boolean)
    .join(" - ")

  return [line1, line2].filter(Boolean).join(" • ") || "Endereço não informado"
}

function calculateDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    async function loadRestaurants() {
      try {
        console.log("=== CARREGANDO RESTAURANTES ===")
        const data = await getRestaurants()
        console.log("=== RESPOSTA RESTAURANTES ===", data)

        if (Array.isArray(data)) {
          setRestaurants(data)
        } else {
          console.warn("Resposta não é array:", data)
          setRestaurants([])
        }
      } catch (err: any) {
        console.error("Erro ao carregar restaurantes:", err)
        console.error("response:", err?.response)
        console.error("response.data:", err?.response?.data)
        setError("Erro ao carregar restaurantes")
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ])
      },
      (err) => {
        console.error("Erro ao obter localização do usuário:")
        console.error("code:", err.code)
        console.error("message:", err.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  const restaurantsWithLocation = useMemo(() => {
    return restaurants.filter(
      (restaurant) =>
        restaurant.latitude !== null &&
        restaurant.latitude !== undefined &&
        restaurant.longitude !== null &&
        restaurant.longitude !== undefined
    )
  }, [restaurants])

  const sortedRestaurants = useMemo(() => {
    if (!userLocation) return restaurants

    const [userLat, userLng] = userLocation

    return [...restaurants].sort((a, b) => {
      const aHasLocation =
        a.latitude !== null &&
        a.latitude !== undefined &&
        a.longitude !== null &&
        a.longitude !== undefined

      const bHasLocation =
        b.latitude !== null &&
        b.latitude !== undefined &&
        b.longitude !== null &&
        b.longitude !== undefined

      if (!aHasLocation && !bHasLocation) return 0
      if (!aHasLocation) return 1
      if (!bHasLocation) return -1

      const distanceA = calculateDistanceInKm(
        userLat,
        userLng,
        Number(a.latitude),
        Number(a.longitude)
      )

      const distanceB = calculateDistanceInKm(
        userLat,
        userLng,
        Number(b.latitude),
        Number(b.longitude)
      )

      return distanceA - distanceB
    })
  }, [restaurants, userLocation])

  const defaultCenter: [number, number] = userLocation
    ? userLocation
    : restaurantsWithLocation.length > 0
    ? [
        restaurantsWithLocation.reduce((sum, r) => sum + Number(r.latitude), 0) /
          restaurantsWithLocation.length,
        restaurantsWithLocation.reduce((sum, r) => sum + Number(r.longitude), 0) /
          restaurantsWithLocation.length,
      ]
    : [-8.118055, -34.894444]

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Categories />
      <HeroBanner />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Restaurantes próximos
          </h1>
        </div>

        {restaurantsWithLocation.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-4 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mapa dos restaurantes
            </h2>

            <div className="rounded-2xl overflow-hidden">
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation && (
                  <Marker position={userLocation}>
                    <Popup>📍 Você está aqui</Popup>
                  </Marker>
                )}

                {restaurantsWithLocation.map((restaurant) => (
                  <Marker
                    key={restaurant.id}
                    position={[
                      Number(restaurant.latitude),
                      Number(restaurant.longitude),
                    ]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-bold">{restaurant.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatAddress(restaurant)}
                        </p>
                        <p className="text-sm text-red-500 mt-2">
                          Entrega R$ {Number(restaurant.delivery_fee).toFixed(2)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {loading && <p>Carregando restaurantes...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && sortedRestaurants.length === 0 && (
          <p className="text-gray-500">Nenhum restaurante encontrado.</p>
        )}

        {!loading && !error && sortedRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedRestaurants.map((restaurant) => {
              const hasLocation =
                restaurant.latitude !== null &&
                restaurant.latitude !== undefined &&
                restaurant.longitude !== null &&
                restaurant.longitude !== undefined

              const distance =
                userLocation && hasLocation
                  ? calculateDistanceInKm(
                      userLocation[0],
                      userLocation[1],
                      Number(restaurant.latitude),
                      Number(restaurant.longitude)
                    )
                  : null

              return (
                <div key={restaurant.id} className="space-y-3">
                  <RestaurantCard
                    restaurant={{
                      id: restaurant.id,
                      name: restaurant.name,
                      category: restaurant.description || "Restaurante",
                      rating: 4.8,
                      deliveryTime: `Entrega R$ ${Number(
                        restaurant.delivery_fee
                      ).toFixed(2)}`,
                      image:
                        restaurant.image ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
                    }}
                  />

                  <div className="bg-white rounded-2xl shadow px-4 py-3">
                    <p className="text-sm text-gray-700 font-medium">
                      📍 {formatAddress(restaurant)}
                    </p>

                    {distance !== null ? (
                      <p className="text-xs text-green-600 mt-1">
                        Aproximadamente {distance.toFixed(1)} km de você
                      </p>
                    ) : hasLocation ? (
                      <p className="text-xs text-green-600 mt-1">
                        Localização disponível no mapa
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">
                        Localização ainda não cadastrada
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}