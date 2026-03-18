import { useState } from "react"
import Navbar from "../components/Navbar"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../api/auth"

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"customer" | "restaurant" | "courier" | "admin">("customer")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (loading) return

    setError("")
    setMessage("")

    try {
      setLoading(true)

      const data = await registerUser({
        name,
        email,
        password,
        role,
      })

      console.log("REGISTER OK:", data)

      setMessage("Conta criada com sucesso!")
      setTimeout(() => navigate("/login"), 1000)
    } catch (err: any) {
      console.error("ERRO REGISTER:", err)
      console.error("response:", err?.response)
      console.error("response.data:", err?.response?.data)

      const detail = err?.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h1>
          <p className="text-gray-500 mb-6">Cadastre-se no Menu Express</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
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
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de conta
              </label>
              <select
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="customer">Cliente</option>
                <option value="restaurant">Restaurante</option>
                <option value="courier">Entregador</option>
              </select>
            </div>

            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-xl font-semibold transition"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-red-500 font-semibold hover:text-red-600"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
