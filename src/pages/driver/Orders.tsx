import { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import {
  getAvailableDriverOrders,
  assignDriverToOrder,
  getDriverOrders,
} from "../../api/orders"
import { updateDriverLocation } from "../../api/orders"

export default function DriverOrders() {

  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const user = JSON.parse(localStorage.getItem("user") || "null")

  async function loadData() {
      try {
        const courierId = user?.driverProfile?.id || user?.id

        const [available, mine] = await Promise.all([
          getAvailableDriverOrders(),
          getDriverOrders(courierId),
        ])

        setAvailableOrders(Array.isArray(available) ? available : [])
        setMyOrders(Array.isArray(mine) ? mine : [])
      } catch (err) {
        console.error(err)
        setError("Erro ao carregar pedidos do entregador")
      } finally {
        setLoading(false)
      }
    }

  async function handleAcceptDelivery(orderId: number) {

      try {

        const courierId = user?.driverProfile?.id || user?.id

        const [available, mine] = await Promise.all([
          getAvailableDriverOrders(),
          getDriverOrders(courierId),
        ])

        await assignDriverToOrder(orderId, courierId)

        startDriverTracking(orderId)

        await loadData()

      } catch (err) {
          console.error(err)
          alert("Erro ao aceitar entrega")
     }
  }

  useEffect(() => {

    loadData()

    const interval = setInterval(() => {
      loadData()
    }, 5000)

    return () => clearInterval(interval)

  }, [])

  function startDriverTracking(orderId: number) {

     if (!navigator.geolocation) return

     navigator.geolocation.watchPosition((position) => {

       const lat = position.coords.latitude
       const lng = position.coords.longitude

       updateDriverLocation(orderId, lat, lng)

     })
  }


  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="max-w-6xl mx-auto p-6 space-y-10">

        <h1 className="text-3xl font-bold text-gray-900">
          Painel do Entregador
        </h1>

        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {loading && (
          <p>Carregando pedidos...</p>
        )}

        {/* PEDIDOS DISPONÍVEIS */}

        <section>

          <h2 className="text-2xl font-bold mb-4">
            Entregas disponíveis
          </h2>

          {availableOrders.length === 0 && (
            <p className="text-gray-500">
              Nenhuma entrega disponível no momento
            </p>
          )}

          <div className="space-y-4">

            {availableOrders.map((order) => (

              <div
                key={order.id}
                className="bg-white rounded-2xl shadow p-5"
              >

                <div className="flex justify-between items-start">

                  <div className="space-y-2">

                    <p className="font-bold text-lg">
                      Pedido #{order.id}
                    </p>

                    <p className="text-gray-700">
                      Restaurante: {order.restaurant_name || "Não informado"}
                    </p>

                    <p className="text-gray-700">
                      Cliente: {order.customer_name || "Não informado"}
                    </p>

                    <p className="text-gray-600 text-sm">
                      Endereço restaurante:
                      {" "}
                      {order.restaurant_address || "Não informado"}
                    </p>

                    <p className="text-gray-600 text-sm">
                      Endereço entrega:
                      {" "}
                      {order.delivery_address || "Não informado"}
                    </p>

                    <p className="text-gray-600 text-sm">
                      Tempo estimado:
                      {" "}
                      {order.estimated_total_minutes || 30} minutos
                    </p>

                    <p className="font-semibold text-green-600">
                      Total: R$ {Number(order.total || 0).toFixed(2)}
                    </p>

                    <p className="text-sm text-gray-500">
                      Status: {order.status}
                    </p>

                  </div>

                  <div>

                    <button
                      onClick={() => handleAcceptDelivery(order.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg"
                    >
                      Aceitar entrega
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* MINHAS ENTREGAS */}

        <section>

          <h2 className="text-2xl font-bold mb-4">
            Minhas entregas
          </h2>

          {myOrders.length === 0 && (
            <p className="text-gray-500">
              Você ainda não aceitou nenhuma entrega
            </p>
          )}

          <div className="space-y-4">

            {myOrders.map((order) => (

              <div
                key={order.id}
                className="bg-white rounded-2xl shadow p-5"
              >

                <p className="font-bold text-lg">
                  Pedido #{order.id}
                </p>

                <p>
                  Restaurante:
                  {" "}
                  {order.restaurant_name || "Não informado"}
                </p>

                <p>
                  Cliente:
                  {" "}
                  {order.customer_name || "Não informado"}
                </p>

                <p className="text-sm text-gray-600">
                  Endereço entrega:
                  {" "}
                  {order.delivery_address || "Não informado"}
                </p>

                <p className="font-semibold text-green-600">
                  Total: R$ {Number(order.total || 0).toFixed(2)}
                </p>

                <p className="text-sm text-gray-500">
                  Status: {order.status}
                </p>

              </div>

            ))}

          </div>

        </section>

      </div>

    </div>
  )
}