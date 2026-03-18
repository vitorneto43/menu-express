import { useState } from "react"
import Navbar from "../components/Navbar"
import { Link, useNavigate } from "react-router-dom"
import { loginUser } from "../api/auth"
import { useCartStore } from "../store/cartStore"

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (loading) return

    setError("")

    try {
      setLoading(true)

      const data = await loginUser({ email, password })

      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))

      if (data.user.role === "customer") {
        useCartStore.getState().loadCart()
      } else {
        useCartStore.getState().clearCart()
      }

      navigate("/")
    } catch (err: any) {
      console.error("ERRO LOGIN:", err)
      console.error("response:", err?.response)
      console.error("response.data:", err?.response?.data)

      const detail = err?.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Entrar</h1>
          <p className="text-gray-500 mb-6">Acesse sua conta no Menu Express</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-xl font-semibold transition"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Ainda não tem conta?{" "}
            <Link
              to="/register"
              className="text-red-500 font-semibold hover:text-red-600"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
