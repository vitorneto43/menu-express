import api from "./client"

export async function onboardRestaurant(restaurantId: number) {
  const response = await api.post(`/stripe/connect/restaurant/${restaurantId}/onboard`)
  return response.data
}

export async function onboardCourier(courierId: number) {
  const response = await api.post(`/stripe/connect/courier/${courierId}/onboard`)
  return response.data
}