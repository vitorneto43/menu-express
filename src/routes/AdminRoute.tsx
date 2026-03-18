import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

export default function AdminRoute({ children }: { children: ReactNode }) {
  const rawUser = localStorage.getItem("user")
  console.log("rawUser admin route =", rawUser)

  const user = rawUser ? JSON.parse(rawUser) : null
  console.log("user admin route =", user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}