import Navbar from "../../components/Navbar"

const earnings = [
  { id: 1, date: "11/03/2026", deliveries: 5, total: "R$ 78,00" },
  { id: 2, date: "10/03/2026", deliveries: 7, total: "R$ 104,00" },
  { id: 3, date: "09/03/2026", deliveries: 4, total: "R$ 61,00" },
]

export default function DriverEarnings() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Ganhos
        </h1>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 p-4 font-semibold text-gray-700">
            <div>Data</div>
            <div>Entregas</div>
            <div>Total</div>
          </div>

          {earnings.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-3 p-4 border-t border-gray-100"
            >
              <div>{item.date}</div>
              <div>{item.deliveries}</div>
              <div className="font-bold text-green-600">{item.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}