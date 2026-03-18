import { Navigate } from "react-router-dom"

export default function AdminRoute({ children }: { children: JSX.Element }) {
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