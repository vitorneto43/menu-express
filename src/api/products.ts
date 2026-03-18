import api from "./client"

export async function getProductsByRestaurant(restaurantId: number) {
  const response = await api.get(`/products/restaurant/${restaurantId}`)
  return response.data
}

export async function createProduct(data: {
  restaurant_id: number
  name: string
  description?: string
  price: number
  image?: string | null
  category?: string
  available?: boolean
}) {
  const response = await api.post("/products", {
    restaurant_id: data.restaurant_id,
    name: data.name,
    description: data.description || null,
    price: Number(data.price),
    image: data.image || null,
    category: data.category || null,
    available: data.available ?? true,
  })
  return response.data
}