import { useEffect, useState } from "react"
import RestaurantPanelLayout from "../../components/RestaurantPanelLayout"
import { getRestaurantByUserId } from "../../api/restaurants"

export default function RestaurantProfile() {
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const savedUser = localStorage.getItem("user")
  const user = savedUser ? JSON.parse(savedUser) : null

  async function loadRestaurant() {
    try {
      const data = await getRestaurantByUserId(user.id)
      setRestaurant(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRestaurant()
  }, [])

  if (loading) {
    return (
      <RestaurantPanelLayout title="Perfil do Restaurante">
        <p>Carregando...</p>
      </RestaurantPanelLayout>
    )
  }

  if (!restaurant) {
    return (
      <RestaurantPanelLayout title="Perfil do Restaurante">
        <p>Restaurante não encontrado</p>
      </RestaurantPanelLayout>
    )
  }

  return (
    <RestaurantPanelLayout title="Perfil do Restaurante">
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-2xl font-bold">{restaurant.name}</h2>

        <p><strong>Dono:</strong> {restaurant.owner_name}</p>
        <p><strong>Telefone:</strong> {restaurant.phone}</p>
        <p><strong>Descrição:</strong> {restaurant.description}</p>

        <p>
          <strong>Endereço:</strong>{" "}
          {restaurant.address?.street}, {restaurant.address?.number} -{" "}
          {restaurant.address?.neighborhood}
        </p>

        {restaurant.image && (
          <img
            src={`https://menuexpress.delivery/${restaurant.image}`}
            alt="Restaurante"
            className="w-full max-w-md rounded-xl"
          />
        )}
      </div>
    </RestaurantPanelLayout>
  )
}