import api from "./client"

export type OrderItem = {
  product_id: number
  quantity: number
}

export type DeliveryAddress = {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  cep: string
  complement?: string
  reference?: string
  latitude?: number | null
  longitude?: number | null
}

export type CreateOrderPayload = {
  restaurant_id: number
  delivery_fee: number
  partner_delivery: boolean
  courier_id?: number | null
  payment_method: string
  subtotal: number
  total: number
  items: OrderItem[]
  delivery_address: DeliveryAddress
}

export type Order = {
  id: number
  user_id: number
  restaurant_id: number
  courier_id: number | null
  delivery_fee: number
  partner_delivery: boolean
  payment_method: string
  subtotal: number
  total: number
  status: string
  created_at: string
  items: OrderItem[]
  delivery_address: DeliveryAddress
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await api.post("/orders", payload)
  return response.data
}

export async function getMyOrders(userId: number): Promise<Order[]> {
  const response = await api.get(`/orders/user/${userId}`)
  return response.data
}

export async function getRestaurantOrders(
  restaurantId: number
): Promise<Order[]> {
  const response = await api.get("/orders/restaurant", {
    params: { restaurant_id: restaurantId },
  })
  return response.data
}

export async function getDriverOrders(courierId: number): Promise<Order[]> {
  const response = await api.get("/orders/driver", {
    params: { courier_id: courierId },
  })
  return response.data
}

export async function getAvailableDriverOrders(): Promise<Order[]> {
  const response = await api.get("/orders/available")
  return response.data
}

export async function getAdminOrders(): Promise<Order[]> {
  const response = await api.get("/orders")
  return response.data
}

export async function updateOrderStatus(orderId: number, status: string) {
  const response = await api.patch(`/orders/${orderId}/status`, { status })
  return response.data
}

export async function assignDriverToOrder(orderId: number, courierId: number) {
  const response = await api.patch(`/orders/${orderId}/assign-driver`, {
    courier_id: courierId,
  })
  return response.data
}

export async function updateDriverLocation(
  orderId: number,
  latitude: number,
  longitude: number
) {
  const response = await api.put(`/orders/${orderId}/driver-location`, {
    latitude,
    longitude,
  })
  return response.data
}