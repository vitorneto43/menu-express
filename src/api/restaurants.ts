import api from "./client"

export async function getRestaurants() {
  const response = await api.get("/restaurants")
  return response.data
}

export async function getRestaurantById(id: string | number) {
  const response = await api.get(`/restaurants/${id}`)
  return response.data
}

export async function getRestaurantByUserId(userId: number) {
  const response = await api.get(`/restaurants/user/${userId}`)
  return response.data
}



export async function createRestaurant(data: {
  user_id: number
  name: string
  owner_name?: string
  description?: string
  image?: File | string | null
  phone?: string

  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_cep?: string

  latitude?: number | string | null
  longitude?: number | string | null

  delivery_fee?: number | string
  pix_key?: string
  bank_name?: string
  account_type?: string
  agency?: string
  account_number?: string
  document_number?: string
}) {
  const formData = new FormData()

  formData.append("user_id", String(Number(data.user_id)))
  formData.append("name", data.name.trim())

  if (data.owner_name?.trim()) formData.append("owner_name", data.owner_name.trim())
  if (data.description?.trim()) formData.append("description", data.description.trim())
  if (data.phone?.trim()) formData.append("phone", data.phone.trim())

  if (data.address_street?.trim()) formData.append("address_street", data.address_street.trim())
  if (data.address_number?.trim()) formData.append("address_number", data.address_number.trim())
  if (data.address_neighborhood?.trim()) formData.append("address_neighborhood", data.address_neighborhood.trim())
  if (data.address_city?.trim()) formData.append("address_city", data.address_city.trim())
  if (data.address_state?.trim()) formData.append("address_state", data.address_state.trim())
  if (data.address_cep?.trim()) formData.append("address_cep", data.address_cep.trim())

  if (data.latitude !== undefined && data.latitude !== null && data.latitude !== "") {
    formData.append("latitude", String(Number(data.latitude)))
  }

  if (data.longitude !== undefined && data.longitude !== null && data.longitude !== "") {
    formData.append("longitude", String(Number(data.longitude)))
  }

  formData.append("delivery_fee", String(Number(data.delivery_fee || 0)))

  if (data.pix_key?.trim()) formData.append("pix_key", data.pix_key.trim())
  if (data.bank_name?.trim()) formData.append("bank_name", data.bank_name.trim())
  if (data.account_type?.trim()) formData.append("account_type", data.account_type.trim())
  if (data.agency?.trim()) formData.append("agency", data.agency.trim())
  if (data.account_number?.trim()) formData.append("account_number", data.account_number.trim())
  if (data.document_number?.trim()) formData.append("document_number", data.document_number.trim())

  if (data.image instanceof File) {
    formData.append("image", data.image)
  }

  const response = await api.post("/restaurants", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}