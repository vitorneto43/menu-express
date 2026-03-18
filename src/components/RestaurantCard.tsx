import { useNavigate } from "react-router-dom"

type Restaurant = {
  id: number
  name: string
  category: string
  rating: number
  deliveryTime: string
  image: string
}

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden cursor-pointer"
    >
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="w-full h-44 object-cover"
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-xl text-gray-900">
              {restaurant.name}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {restaurant.category}
            </p>
          </div>

          <span className="bg-yellow-50 text-yellow-700 text-sm font-semibold px-2 py-1 rounded-lg">
            ⭐ {restaurant.rating}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>{restaurant.deliveryTime}</span>
          <span className="text-green-600 font-medium">Entrega disponível</span>
        </div>
      </div>
    </div>
  )
}