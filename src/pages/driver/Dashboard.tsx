import { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import { getCourierByUserId } from "../../api/couriers"
import {
  assignDriverToOrder,
  getAvailableDriverOrders,
  getDriverOrders,
  updateOrderStatus,
} from "../../api/orders"

export default function DriverDashboard() {
  const [courier, setCourier] = useState<any>(null)
  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [acceptingOrderId, setAcceptingOrderId] = useState<number | null>(null)
  const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<number | null>(null)

  async function loadData() {
    try {
      setLoading(true)
      setError("")

      const savedUser = localStorage.getItem("user")
      if (!savedUser) {
        setError("Usuário não autenticado")
        return
      }

      const user = JSON.parse(savedUser)

      const courierData = await getCourierByUserId(Number(user.id))
      setCourier(courierData)

      const available = await getAvailableDriverOrders()
      setAvailableOrders(Array.isArray(available) ? available : [])

      const mine = await getDriverOrders(courierData.id)
      setMyOrders(Array.isArray(mine) ? mine : [])
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar painel do entregador")
    } finally {
      setLoading(false)
    }
  }

  async function handleAcceptOrder(orderId: number) {
    try {
      if (!courier?.id) {
        alert("Entregador não identificado")
        return
      }

      setAcceptingOrderId(orderId)

      await assignDriverToOrder(orderId, courier.id)

      const available = await getAvailableDriverOrders()
      setAvailableOrders(Array.isArray(available) ? available : [])

      const mine = await getDriverOrders(courier.id)
      setMyOrders(Array.isArray(mine) ? mine : [])

      alert("Pedido aceito com sucesso")
    } catch (error: any) {
      console.error(error)
      alert(error?.response?.data?.detail || "Erro ao aceitar pedido")
    } finally {
      setAcceptingOrderId(null)
    }
  }

  async function handleUpdateDeliveryStatus(orderId: number, status: string) {
    try {
      setUpdatingStatusOrderId(orderId)

      await updateOrderStatus(orderId, status)

      if (courier?.id) {
        const mine = await getDriverOrders(courier.id)
        setMyOrders(Array.isArray(mine) ? mine : [])
      }

      const available = await getAvailableDriverOrders()
      setAvailableOrders(Array.isArray(available) ? available : [])

      alert("Status da entrega atualizado")
    } catch (error: any) {
      console.error(error)
      alert(error?.response?.data?.detail || "Erro ao atualizar entrega")
    } finally {
      setUpdatingStatusOrderId(null)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Painel do Entregador</h1>

        {loading && <p>Carregando painel...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-3">Meus dados</h2>
              <p><strong>Nome:</strong> {courier?.name}</p>
              <p><strong>Telefone:</strong> {courier?.phone}</p>
              <p><strong>Veículo:</strong> {courier?.vehicle_type}</p>
              <p><strong>PIX:</strong> {courier?.pix_key}</p>
              <p><strong>Status:</strong> {courier?.active ? "Ativo" : "Inativo"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">Pedidos disponíveis</h2>

                {availableOrders.length === 0 ? (
                  <p className="text-gray-500">Nenhum pedido disponível no momento.</p>
                ) : (
                  <div className="space-y-4">
                    {availableOrders.map((order) => (
                      <div key={order.id} className="border rounded-xl p-4">
                        <p className="font-semibold">
                          Pedido {order.order_number || order.id}
                        </p>
                        <p>Restaurante: {order.restaurant_name}</p>
                        <p>Total: R$ {Number(order.total || 0).toFixed(2)}</p>
                        <p>Status: {order.status}</p>

                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={acceptingOrderId === order.id}
                          className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                        >
                          {acceptingOrderId === order.id ? "Aceitando..." : "Aceitar pedido"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">Minhas entregas</h2>

                {myOrders.length === 0 ? (
                  <p className="text-gray-500">Você ainda não possui entregas atribuídas.</p>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => (
                      <div key={order.id} className="border rounded-xl p-4">
                        <p className="font-semibold">
                          Pedido {order.order_number || order.id}
                        </p>
                        <p>Cliente: {order.user_name || "Cliente"}</p>
                        <p>Restaurante: {order.restaurant_name}</p>
                        <p>Total: R$ {Number(order.total || 0).toFixed(2)}</p>
                        <p>Status: {order.status}</p>

                        <div className="mt-3 flex gap-2 flex-wrap">
                          {order.status === "picked_up" && (
                            <button
                              onClick={() =>
                                handleUpdateDeliveryStatus(order.id, "on_the_way")
                              }
                              disabled={updatingStatusOrderId === order.id}
                              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                            >
                              {updatingStatusOrderId === order.id
                                ? "Atualizando..."
                                : "Sair para entrega"}
                            </button>
                          )}

                          {order.status === "on_the_way" && (
                            <button
                              onClick={() =>
                                handleUpdateDeliveryStatus(order.id, "delivered")
                              }
                              disabled={updatingStatusOrderId === order.id}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                            >
                              {updatingStatusOrderId === order.id
                                ? "Atualizando..."
                                : "Concluir entrega"}
                            </button>
                          )}

                          {order.status === "delivered" && (
                            <span className="inline-block bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                              Entrega concluída
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
