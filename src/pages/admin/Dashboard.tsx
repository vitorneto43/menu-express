import Navbar from "../../components/Navbar"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Painel Admin - Menu Express
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">Pedidos hoje</p>
            <h2 className="text-3xl font-bold mt-2">128</h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">Faturamento total</p>
            <h2 className="text-3xl font-bold mt-2 text-green-600">
              R$ 18.540,00
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">Comissão 9%</p>
            <h2 className="text-3xl font-bold mt-2 text-red-500">
              R$ 1.668,60
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">20% entrega parceira</p>
            <h2 className="text-3xl font-bold mt-2 text-blue-600">
              R$ 420,00
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold mb-4">Resumo da operação</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Restaurantes ativos</span>
                <span className="font-semibold">42</span>
              </div>
              <div className="flex justify-between">
                <span>Entregadores online</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between">
                <span>Pedidos em andamento</span>
                <span className="font-semibold">27</span>
              </div>
              <div className="flex justify-between">
                <span>Pedidos concluídos hoje</span>
                <span className="font-semibold">101</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold mb-4">Receita da plataforma</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Comissão sobre pedidos</span>
                <span className="font-semibold text-red-500">R$ 1.668,60</span>
              </div>
              <div className="flex justify-between">
                <span>Comissão entrega parceira</span>
                <span className="font-semibold text-blue-600">R$ 420,00</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-bold">Total Menu Express</span>
                <span className="font-bold text-green-600">R$ 2.088,60</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}