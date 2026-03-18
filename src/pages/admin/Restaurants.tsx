import Navbar from "../../components/Navbar"

const restaurants = [
  { id: 1, name: "Burger House", status: "Ativo", city: "Recife" },
  { id: 2, name: "Pizza Itália", status: "Ativo", city: "Jaboatão" },
  { id: 3, name: "Sushi Tokyo", status: "Pendente", city: "Olinda" },
]

export default function AdminRestaurants() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Restaurantes</h1>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-50 p-4 font-semibold text-gray-700">
            <div>ID</div>
            <div>Nome</div>
            <div>Cidade</div>
            <div>Status</div>
          </div>

          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="grid grid-cols-4 p-4 border-t border-gray-100"
            >
              <div>{restaurant.id}</div>
              <div>{restaurant.name}</div>
              <div>{restaurant.city}</div>
              <div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
                  {restaurant.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}