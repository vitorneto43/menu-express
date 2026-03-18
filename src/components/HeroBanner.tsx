export default function HeroBanner() {
  return (
    <div className="max-w-6xl mx-auto px-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500 text-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm font-medium opacity-90">Promoção do dia</p>
          <h2 className="text-2xl font-bold mt-2">Entrega grátis</h2>
          <p className="mt-2 text-sm opacity-90">
            Em restaurantes selecionados perto de você
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <p className="text-sm text-gray-500">Cupom de boas-vindas</p>
          <h2 className="text-2xl font-bold mt-2 text-gray-900">MENU10</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ganhe desconto no seu primeiro pedido
          </p>
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm opacity-80">Parceiros em destaque</p>
          <h2 className="text-2xl font-bold mt-2">Os mais pedidos</h2>
          <p className="mt-2 text-sm opacity-90">
            Veja os restaurantes com melhor avaliação
          </p>
        </div>
      </div>
    </div>
  )
}