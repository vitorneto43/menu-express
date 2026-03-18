import api from "./client"

type RegisterPayload = {
  name: string
  email: string
  password: string
  role: "customer" | "restaurant" | "courier" | "admin"
}

type LoginPayload = {
  email: string
  password: string
}

export async function registerUser(data: RegisterPayload) {
  const response = await api.post("/auth/register", data)
  return response.data
}

export async function loginUser(data: LoginPayload) {
  const response = await api.post("/auth/login", data)
  return response.data
}
