import Navbar from "../../components/Navbar"

const commissions = [
  {
    id: 1,
    order: 501,
    restaurantAmount: "R$ 91,00",
    platform9: "R$ 9,00",
    driverAmount: "R$ 16,00",
    platformDelivery: "R$ 4,00"
  },
  {
    id: 2,
    order: 502,
    restaurantAmount: "R$ 136,50",
    platform9: "R$ 13,50",
    driverAmount: "R$ 12,00",
    platformDelivery: "R$ 3,00"
  }
]

export default function AdminCommissions() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Comissões da Plataforma</h1>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="grid grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 bg-gray-50 p-4 font-semibold text-gray-700">
            <div>Pedido</div>
            <div>Restaurante</div>
            <div>Menu 9%</div>
            <div>Entregador</div>
            <div>Menu 20% entrega</div>
          </div>

          {commissions.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-5 p-4 border-t border-gray-100 text-sm"
            >
              <div>#{item.order}</div>
              <div>{item.restaurantAmount}</div>
              <div className="text-red-500 font-semibold">{item.platform9}</div>
              <div className="text-green-600 font-semibold">{item.driverAmount}</div>
              <div className="text-blue-600 font-semibold">{item.platformDelivery}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}