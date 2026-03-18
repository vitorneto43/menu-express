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
  image?: string | null
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
  const payload = {
    user_id: Number(data.user_id),
    name: data.name.trim(),
    owner_name: data.owner_name?.trim() || null,
    description: data.description?.trim() || null,
    image: data.image?.trim() || null,
    phone: data.phone?.trim() || null,

    address_street: data.address_street?.trim() || null,
    address_number: data.address_number?.trim() || null,
    address_neighborhood: data.address_neighborhood?.trim() || null,
    address_city: data.address_city?.trim() || null,
    address_state: data.address_state?.trim() || null,
    address_cep: data.address_cep?.trim() || null,

    latitude:
      data.latitude !== undefined && data.latitude !== null && data.latitude !== ""
        ? Number(data.latitude)
        : null,
    longitude:
      data.longitude !== undefined && data.longitude !== null && data.longitude !== ""
        ? Number(data.longitude)
        : null,

    delivery_fee: Number(data.delivery_fee || 0),
    pix_key: data.pix_key?.trim() || null,
    bank_name: data.bank_name?.trim() || null,
    account_type: data.account_type?.trim() || null,
    agency: data.agency?.trim() || null,
    account_number: data.account_number?.trim() || null,
    document_number: data.document_number?.trim() || null,
  }

  const response = await api.post("/restaurants", payload)
  return response.data
}