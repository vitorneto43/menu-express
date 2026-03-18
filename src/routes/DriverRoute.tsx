import { Navigate } from "react-router-dom"

type User = {
  id: number | string
  role?: "customer" | "restaurant" | "driver" | "courier" | "admin"
  driverProfile?: any
  courierProfile?: any
}

export default function DriverRoute({ children }: { children: JSX.Element }) {
  const user: User | null = JSON.parse(localStorage.getItem("user") || "null")

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasDriverProfile = !!(user.driverProfile || user.courierProfile)
  const isDriverRole = user.role === "driver" || user.role === "courier"

  if (!isDriverRole && !hasDriverProfile) {
    return <Navigate to="/driver/register" replace />
  }

  return children
}
