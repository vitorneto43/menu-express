import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import RestaurantPanelLayout from "../../components/RestaurantPanelLayout"
import { getRestaurantByUserId } from "../../api/restaurants"
import { getRestaurantOrders, type Order as ApiOrder } from "../../api/orders"

type Restaurant = {
  id: number
  name: string
}

export default function RestaurantDashboard() {
  const navigate = useNavigate()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError("")

        const savedUser = localStorage.getItem("user")
        if (!savedUser) {
          setError("Usuário não autenticado")
          return
        }

        const user = JSON.parse(savedUser)
        const restaurantData = await getRestaurantByUserId(user.id)

        if (!restaurantData?.id) {
          setError("Restaurante não encontrado para este usuário")
          return
        }

        setRestaurant(restaurantData)

        const ordersData = await getRestaurantOrders(restaurantData.id)
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      } catch (err) {
        console.error("Erro ao carregar dashboard do restaurante:", err)
        setError("Erro ao carregar dados do painel")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const todayKey = new Date().toDateString()

  const pedidosHoje = useMemo(() => {
    return orders.filter(
      (order) => new Date(order.created_at).toDateString() === todayKey
    ).length
  }, [orders, todayKey])

  const faturamentoHoje = useMemo(() => {
    return orders
      .filter(
        (order) =>
          new Date(order.created_at).toDateString() === todayKey &&
          order.status !== "cancelled"
      )
      .reduce((acc, order) => acc + Number(order.total || 0), 0)
  }, [orders, todayKey])

  const pedidosEmAndamento = useMemo(() => {
    return orders.filter((order) =>
      ["accepted", "preparing", "picked_up", "on_the_way"].includes(order.status)
    ).length
  }, [orders])

  const pedidosProntos = useMemo(() => {
    return orders.filter((order) => order.status === "ready").length
  }, [orders])

  const pedidosPendentes = useMemo(() => {
    return orders.filter((order) => order.status === "pending").length
  }, [orders])

  if (loading) {
    return (
      <RestaurantPanelLayout title="Dashboard do Restaurante">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <p className="text-gray-600">Carregando dados do painel...</p>
        </div>
      </RestaurantPanelLayout>
    )
  }

  if (error) {
    return (
      <RestaurantPanelLayout title="Dashboard do Restaurante">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </RestaurantPanelLayout>
    )
  }

  return (
    <RestaurantPanelLayout title="Dashboard do Restaurante">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {restaurant?.name || "Restaurante"}
          </h2>
          <p className="text-gray-500 mt-1">Visão geral da operação do dia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <p className="text-gray-500">Pedidos hoje</p>
            <h2 className="text-3xl font-bold mt-2 text-gray-900">
              {pedidosHoje}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <p className="text-gray-500">Faturamento hoje</p>
            <h2 className="text-3xl font-bold mt-2 text-green-600">
              R$ {faturamentoHoje.toFixed(2)}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <p className="text-gray-500">Avaliação média</p>
            <h2 className="text-2xl font-bold mt-2 text-yellow-500">
              Sem avaliações ainda
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ações rápidas
          </h2>
          <p className="text-gray-600 mb-6">
            Gerencie rapidamente os principais recursos do seu restaurante.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => navigate("/restaurant/orders")}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-5 text-left transition shadow"
            >
              <p className="text-lg font-bold">Pedidos</p>
              <p className="text-sm text-blue-100 mt-2">
                Acompanhe e atualize o status dos pedidos
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/restaurant/menu")}
              className="bg-green-500 hover:bg-green-600 text-white rounded-2xl p-5 text-left transition shadow"
            >
              <p className="text-lg font-bold">Cardápio</p>
              <p className="text-sm text-green-100 mt-2">
                Cadastre e edite os produtos do restaurante
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/restaurant/promotions")}
              className="bg-red-500 hover:bg-red-600 text-white rounded-2xl p-5 text-left transition shadow"
            >
              <p className="text-lg font-bold">Promoções</p>
              <p className="text-sm text-red-100 mt-2">
                Crie ofertas para atrair mais clientes
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/restaurant/profile")}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl p-5 text-left transition shadow"
            >
              <p className="text-lg font-bold">Perfil</p>
              <p className="text-sm text-purple-100 mt-2">
                Atualize os dados e informações do restaurante
              </p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Resumo operacional
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl p-5">
              <p className="text-gray-500 text-sm">Pedidos em andamento</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {pedidosEmAndamento}
              </h3>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <p className="text-gray-500 text-sm">Pedidos prontos</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {pedidosProntos}
              </h3>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <p className="text-gray-500 text-sm">Pedidos pendentes</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {pedidosPendentes}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </RestaurantPanelLayout>
  )
}