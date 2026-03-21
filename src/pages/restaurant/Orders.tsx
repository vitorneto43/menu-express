import { useEffect, useMemo, useState } from "react"
import Navbar from "../../components/Navbar"
import { getRestaurantByUserId } from "../../api/restaurants"
import {
  getRestaurantOrders,
  updateOrderStatus,
} from "../../api/orders"

type OrderType = {
  id: number
  order_number?: string
  estimated_preparation_minutes?: number
  estimated_delivery_minutes?: number
  estimated_total_minutes?: number
  status: string
  total?: number
  user_name?: string
  customer_name?: string
  delivery_address?: {
    street?: string
    number?: string
    neighborhood?: string
    city?: string
    state?: string
    cep?: string
    complement?: string
    reference?: string
  }
  items?: Array<{
    id?: number
    product_name?: string
    quantity?: number
    price?: number
  }>
}

type TabType = "ativos" | "historico"

export default function RestaurantOrders() {
  const [orders, setOrders] = useState<OrderType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [restaurantId, setRestaurantId] = useState<number | null>(null)
  const [tab, setTab] = useState<TabType>("ativos")

  const savedUser = localStorage.getItem("user")
  const user = savedUser ? JSON.parse(savedUser) : null

  function formatStatus(status: string) {
    switch (status) {
      case "pending":
        return "Aguardando pagamento"
      case "accepted":
        return "Aceito"
      case "preparing":
        return "Em preparo"
      case "ready":
        return "Pronto para retirada"
      case "picked_up":
        return "Retirado pelo entregador"
      case "on_the_way":
        return "A caminho"
      case "delivered":
        return "Entregue"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700"
      case "accepted":
        return "bg-blue-100 text-blue-700"
      case "preparing":
        return "bg-yellow-100 text-yellow-700"
      case "ready":
        return "bg-green-100 text-green-700"
      case "picked_up":
        return "bg-purple-100 text-purple-700"
      case "on_the_way":
        return "bg-indigo-100 text-indigo-700"
      case "delivered":
        return "bg-emerald-100 text-emerald-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  async function loadRestaurant() {
    try {
      if (!user?.id) {
        setError("Usuário não identificado")
        setLoading(false)
        return
      }

      const restaurant = await getRestaurantByUserId(Number(user.id))
      setRestaurantId(restaurant.id)
    } catch (err) {
      console.error(err)
      setError("Restaurante não encontrado para este usuário")
      setLoading(false)
    }
  }

  async function loadOrders(showLoading = false, currentRestaurantId?: number) {
    try {
      const idToUse = currentRestaurantId ?? restaurantId

      if (!idToUse) {
        setError("Restaurante não identificado")
        return
      }

      if (showLoading) setLoading(true)
      setError("")

      const data = await getRestaurantOrders(idToUse)
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar pedidos")
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  async function handleStatusChange(orderId: number, status: string) {
    try {
      await updateOrderStatus(orderId, status)

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      )

      await loadOrders(false, restaurantId ?? undefined)
    } catch (err: any) {
      console.error("=== ERRO AO ALTERAR STATUS ===", err)
      console.error("response:", err?.response)
      console.error("response.data:", err?.response?.data)

      alert(
        typeof err?.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Erro ao atualizar status do pedido"
      )
    }
  }

  useEffect(() => {
    loadRestaurant()
  }, [])

  useEffect(() => {
    if (!restaurantId) return

    loadOrders(true, restaurantId)

    const interval = setInterval(() => {
      loadOrders(false, restaurantId)
    }, 5000)

    return () => clearInterval(interval)
  }, [restaurantId])

  const pendingPaymentOrders = useMemo(
    () => orders.filter((order) => order.status === "pending"),
    [orders]
  )

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["accepted", "preparing", "ready", "picked_up", "on_the_way"].includes(
          order.status
        )
      ),
    [orders]
  )

  const historyOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["delivered", "cancelled"].includes(order.status)
      ),
    [orders]
  )

  function renderActionButtons(order: OrderType) {
    switch (order.status) {
      case "accepted":
        return (
          <>
            <button
              onClick={() => handleStatusChange(order.id, "preparing")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-xl font-medium text-center transition"
            >
              Em preparo
            </button>

            <button
              onClick={() => handleStatusChange(order.id, "cancelled")}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium text-center transition"
            >
              Cancelar pedido
            </button>
          </>
        )

      case "preparing":
        return (
          <>
            <button
              onClick={() => handleStatusChange(order.id, "ready")}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-medium text-center transition"
            >
              Pronto para retirada
            </button>

            <button
              onClick={() => handleStatusChange(order.id, "cancelled")}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium text-center transition"
            >
              Cancelar pedido
            </button>
          </>
        )

      case "ready":
        return (
          <div className="w-full bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium text-center">
            Aguardando o entregador retirar o pedido
          </div>
        )

      case "picked_up":
        return (
          <div className="w-full bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-xl text-sm font-medium text-center">
            Pedido retirado pelo entregador
          </div>
        )

      case "on_the_way":
        return (
          <div className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-xl text-sm font-medium text-center">
            Pedido a caminho do cliente
          </div>
        )

      default:
        return (
          <>
            <button
              onClick={() => handleStatusChange(order.id, "accepted")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium text-center transition"
            >
              Aceitar pedido
            </button>

            <button
              onClick={() => handleStatusChange(order.id, "preparing")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-xl font-medium text-center transition"
            >
              Em preparo
            </button>

            <button
              onClick={() => handleStatusChange(order.id, "ready")}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-medium text-center transition"
            >
              Pronto para retirada
            </button>

            <button
              onClick={() => handleStatusChange(order.id, "cancelled")}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium text-center transition"
            >
              Cancelar pedido
            </button>
          </>
        )
    }
  }

  function renderOrderCard(order: OrderType, isPendingPayment = false) {
    return (
      <div
        key={order.id}
        className="bg-white rounded-2xl shadow p-6 border border-gray-100"
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <p className="font-bold text-xl text-gray-900">
                Pedido {order.order_number || `ME-${String(order.id).padStart(5, "0")}`}
              </p>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold w-fit ${getStatusBadgeClass(order.status)}`}
              >
                {formatStatus(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Cliente:</span>{" "}
                {order.user_name || order.customer_name || "Cliente"}
              </p>
              <p>
                <span className="font-semibold">Total:</span> R${" "}
                {Number(order.total || 0).toFixed(2)}
              </p>
              <p>
                <span className="font-semibold">Preparo estimado:</span>{" "}
                {order.estimated_preparation_minutes || 25} min
              </p>
              <p>
                <span className="font-semibold">Entrega estimada:</span>{" "}
                {order.estimated_delivery_minutes || 0} min
              </p>
              <p>
                <span className="font-semibold">Tempo total:</span>{" "}
                {order.estimated_total_minutes || 25} min
              </p>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-gray-900 mb-2">Itens do pedido</p>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={item.id ?? `${order.id}-${index}`}
                      className="flex justify-between text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2"
                    >
                      <span>
                        {item.product_name || "Produto"} x{item.quantity || 0}
                      </span>
                      <span>R$ {Number(item.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.delivery_address && (
              <div className="mt-4 text-sm text-gray-700 bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-1">
                  Endereço de entrega
                </p>
                <p>
                  {order.delivery_address.street}, {order.delivery_address.number}
                </p>
                <p>
                  {order.delivery_address.neighborhood} -{" "}
                  {order.delivery_address.city}/{order.delivery_address.state}
                </p>
                <p>CEP: {order.delivery_address.cep}</p>
                {order.delivery_address.complement && (
                  <p>Complemento: {order.delivery_address.complement}</p>
                )}
                {order.delivery_address.reference && (
                  <p>Referência: {order.delivery_address.reference}</p>
                )}
              </div>
            )}

            {isPendingPayment && (
              <div className="mt-4 rounded-xl bg-orange-50 border border-orange-200 p-4">
                <p className="text-sm font-medium text-orange-700">
                  Este pedido ainda está aguardando confirmação de pagamento.
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Não inicie o preparo até o pagamento ser confirmado.
                </p>
              </div>
            )}
          </div>

          {!isPendingPayment && (
            <div className="w-full lg:w-56 flex flex-col gap-3">
              {renderActionButtons(order)}
            </div>
          )}
        </div>
      </div>
    )
  }

  const currentOrders = tab === "ativos" ? activeOrders : historyOrders

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Pedidos do Restaurante
        </h1>

        {loading && <p className="text-gray-600">Carregando pedidos...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {pendingPaymentOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Aguardando pagamento
              </h2>
              <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
                {pendingPaymentOrders.length}
              </span>
            </div>

            <div className="space-y-4">
              {pendingPaymentOrders.map((order) => renderOrderCard(order, true))}
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTab("ativos")}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              tab === "ativos"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Pedidos ativos ({activeOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setTab("historico")}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              tab === "historico"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Histórico ({historyOrders.length})
          </button>
        </div>

        {currentOrders.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
            {tab === "ativos"
              ? "Nenhum pedido ativo no momento."
              : "Nenhum pedido no histórico."}
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => renderOrderCard(order, false))}
          </div>
        )}
      </div>
    </div>
  )
}