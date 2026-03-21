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
  imageFile?: File | null
  category?: string
  available?: boolean
}) {
  const formData = new FormData()

  formData.append("restaurant_id", String(data.restaurant_id))
  formData.append("name", data.name)
  formData.append("description", data.description || "")
  formData.append("price", String(Number(data.price)))
  formData.append("category", data.category || "")
  formData.append("available", String(data.available ?? true))

  if (data.imageFile) {
    formData.append("image", data.imageFile)
  }

  const response = await api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}