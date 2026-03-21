import api from "./axios"

export async function createPixPayment(orderId: number) {
  const response = await api.post(`/payments/pix/${orderId}`)
  return response.data
}