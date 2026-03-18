import { useEffect, useState } from "react"
import { getAdminOrders } from "../../api/orders"

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState("")

  async function loadOrders() {
    try {
      const data = await getAdminOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar pedidos")
    }
  }

  useEffect(() => {
    loadOrders()

    const interval = setInterval(() => {
      loadOrders()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pedidos - Admin</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl shadow p-5">
            <p className="font-bold">Pedido #{order.id}</p>
            <p>Status: {order.status}</p>
            <p>Total: R$ {Number(order.total || 0).toFixed(2)}</p>
            <p>Restaurante: {order.restaurant_name || "Restaurante"}</p>
            <p>Cliente: {order.user_name || "Cliente"}</p>
            <p>Entregador: {order.courier_name || "Não atribuído"}</p>
            <p>Pagamento: {order.payment_method || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  )
}