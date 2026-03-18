import api from "./client"

export type Promotion = {
  id: number
  restaurant_id: number
  product_id?: number | null
  title: string
  description?: string | null
  promotional_price?: number | null
  banner_url?: string | null
  active: boolean
  created_at?: string
  restaurant_name?: string | null
  product_name?: string | null
}

export type CreatePromotionPayload = {
  restaurant_id: number
  product_id?: number | null
  title: string
  description?: string
  promotional_price?: number | null
  banner_url?: string
  active?: boolean
}

export type UpdatePromotionPayload = {
  title?: string
  description?: string
  promotional_price?: number | null
  banner_url?: string
  active?: boolean
  product_id?: number | null
}

export async function getRestaurantPromotions(
  restaurantId: number
): Promise<Promotion[]> {
  const response = await api.get(`/promotions/restaurant/${restaurantId}`)
  return response.data
}

export async function createPromotion(payload: CreatePromotionPayload) {
  const response = await api.post("/promotions", payload)
  return response.data
}

export async function updatePromotion(
  promotionId: number,
  payload: UpdatePromotionPayload
) {
  const response = await api.put(`/promotions/${promotionId}`, payload)
  return response.data
}

export async function deletePromotion(promotionId: number) {
  const response = await api.delete(`/promotions/${promotionId}`)
  return response.data
}