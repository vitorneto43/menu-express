import api from "./client"

export async function updateOrderStatus(orderId: number, status: string) {
  const response = await api.patch(`/orders/${orderId}/status`, { status })
  return response.data
}