import { useNavigate, useLocation } from "react-router-dom"

const links = [
  { label: "Dashboard", path: "/restaurant/dashboard" },
  { label: "Pedidos", path: "/restaurant/orders" },
  { label: "Cardápio", path: "/restaurant/menu" },
  { label: "Cadastrar Restaurante", path: "/restaurant/register" },
]

export default function RestaurantSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="w-full md:w-64 bg-white rounded-2xl shadow p-4 h-fit">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Painel Restaurante</h2>

      <div className="flex flex-col gap-2">
        {links.map((link) => {
          const active = location.pathname === link.path

          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-left px-4 py-3 rounded-xl transition ${
                active
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {link.label}
            </button>
          )
        })}
      </div>
    </aside>
  )
}