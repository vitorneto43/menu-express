import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { getRestaurantByUserId } from "../api/restaurants"

type User = {
  id: number | string
  restaurantProfile?: any
}

export default function RestaurantRoute({
  children,
}: {
  children: JSX.Element
}) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function checkAccess() {
      const rawUser = localStorage.getItem("user")

      if (!rawUser) {
        setAllowed(false)
        setLoading(false)
        return
      }

      const user: User = JSON.parse(rawUser)

      if (user.restaurantProfile) {
        setAllowed(true)
        setLoading(false)
        return
      }

      try {
        const restaurant = await getRestaurantByUserId(Number(user.id))

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            restaurantProfile: restaurant,
          })
        )

        setAllowed(true)
      } catch (err) {
        console.error("Erro ao validar restaurante:", err)
        setAllowed(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [])

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  if (!allowed) {
    return <Navigate to="/restaurant/register" replace />
  }

  return children
}