import Navbar from "../../components/Navbar"

const drivers = [
  { id: 1, name: "Carlos Lima", status: "Online", city: "Recife" },
  { id: 2, name: "Ana Souza", status: "Offline", city: "Piedade" },
  { id: 3, name: "Marcos Silva", status: "Online", city: "Boa Viagem" },
]

export default function AdminDrivers() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Entregadores</h1>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-50 p-4 font-semibold text-gray-700">
            <div>ID</div>
            <div>Nome</div>
            <div>Cidade</div>
            <div>Status</div>
          </div>

          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="grid grid-cols-4 p-4 border-t border-gray-100"
            >
              <div>{driver.id}</div>
              <div>{driver.name}</div>
              <div>{driver.city}</div>
              <div>
                <span
                  className={`px-3 py-1 rounded-lg text-sm ${
                    driver.status === "Online"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {driver.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}