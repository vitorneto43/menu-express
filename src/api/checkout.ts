import api from "./client"

export async function createCheckoutSession(orderId: number) {
  const response = await api.post(`/checkout/session/${orderId}`)
  return response.data
}