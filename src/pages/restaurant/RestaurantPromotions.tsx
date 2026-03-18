import { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import { getRestaurantByUserId } from "../../api/restaurants"
import {
  createPromotion,
  deletePromotion,
  getRestaurantPromotions,
  updatePromotion,
  type Promotion,
} from "../../api/promotions"

export default function RestaurantPromotions() {
  const [restaurantId, setRestaurantId] = useState<number | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [promotionalPrice, setPromotionalPrice] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [active, setActive] = useState(true)

  const savedUser = localStorage.getItem("user")
  const user = savedUser ? JSON.parse(savedUser) : null

  async function loadRestaurant() {
    try {
      if (!user?.id) {
        setError("Usuário não identificado")
        setLoading(false)
        return
      }

      const restaurant = await getRestaurantByUserId(Number(user.id))
      setRestaurantId(restaurant.id)
    } catch (err) {
      console.error(err)
      setError("Restaurante não encontrado para este usuário")
      setLoading(false)
    }
  }

  async function loadPromotions(currentRestaurantId?: number) {
    try {
      const idToUse = currentRestaurantId ?? restaurantId

      if (!idToUse) {
        setError("Restaurante não identificado")
        return
      }

      setError("")
      const data = await getRestaurantPromotions(idToUse)
      setPromotions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar promoções")
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setPromotionalPrice("")
    setBannerUrl("")
    setActive(true)
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!restaurantId) {
      setError("Restaurante não identificado")
      return
    }

    if (!title.trim()) {
      setError("Informe o título da promoção")
      return
    }

    try {
      setSaving(true)
      setError("")

      const payload = {
        restaurant_id: restaurantId,
        title: title.trim(),
        description: description.trim() || undefined,
        promotional_price: promotionalPrice
          ? Number(promotionalPrice)
          : null,
        banner_url: bannerUrl.trim() || undefined,
        active,
      }

      if (editingId) {
        await updatePromotion(editingId, {
          title: payload.title,
          description: payload.description,
          promotional_price: payload.promotional_price,
          banner_url: payload.banner_url,
          active: payload.active,
        })
      } else {
        await createPromotion(payload)
      }

      resetForm()
      await loadPromotions(restaurantId)
    } catch (err: any) {
      console.error(err)
      const detail = err?.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Erro ao salvar promoção")
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(promotion: Promotion) {
    setEditingId(promotion.id)
    setTitle(promotion.title || "")
    setDescription(promotion.description || "")
    setPromotionalPrice(
      promotion.promotional_price !== null &&
        promotion.promotional_price !== undefined
        ? String(promotion.promotional_price)
        : ""
    )
    setBannerUrl(promotion.banner_url || "")
    setActive(Boolean(promotion.active))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleDelete(promotionId: number) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta promoção?"
    )
    if (!confirmed) return

    try {
      await deletePromotion(promotionId)
      await loadPromotions(restaurantId ?? undefined)
    } catch (err: any) {
      console.error(err)
      const detail = err?.response?.data?.detail
      alert(typeof detail === "string" ? detail : "Erro ao excluir promoção")
    }
  }

  async function handleToggleActive(promotion: Promotion) {
    try {
      await updatePromotion(promotion.id, {
        active: !promotion.active,
      })
      await loadPromotions(restaurantId ?? undefined)
    } catch (err: any) {
      console.error(err)
      const detail = err?.response?.data?.detail
      alert(
        typeof detail === "string"
          ? detail
          : "Erro ao alterar status da promoção"
      )
    }
  }

  useEffect(() => {
    loadRestaurant()
  }, [])

  useEffect(() => {
    if (!restaurantId) return
    loadPromotions(restaurantId)
  }, [restaurantId])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Promoções do Restaurante
          </h1>
          <p className="text-gray-600 mt-2">
            Crie ofertas para chamar atenção dos clientes e aumentar as vendas.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {editingId ? "Editar promoção" : "Nova promoção"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da promoção
              </label>
              <input
                type="text"
                placeholder="Ex: Combo Burger + Refri"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                placeholder="Descreva a oferta para atrair os clientes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço promocional
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 19.90"
                  value={promotionalPrice}
                  onChange={(e) => setPromotionalPrice(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do banner
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Promoção ativa
            </label>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                {saving
                  ? "Salvando..."
                  : editingId
                  ? "Atualizar promoção"
                  : "Criar promoção"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded-xl font-semibold transition"
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Promoções cadastradas
            </h2>
            <span className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
              {promotions.length}
            </span>
          </div>

          {loading ? (
            <p className="text-gray-600">Carregando promoções...</p>
          ) : promotions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Nenhuma promoção cadastrada ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="border border-gray-200 rounded-2xl p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {promotion.title}
                        </h3>

                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            promotion.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {promotion.active ? "Ativa" : "Inativa"}
                        </span>
                      </div>

                      {promotion.description && (
                        <p className="text-gray-600 mb-3">
                          {promotion.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                        <p>
                          <span className="font-semibold">
                            Preço promocional:
                          </span>{" "}
                          {promotion.promotional_price !== null &&
                          promotion.promotional_price !== undefined
                            ? `R$ ${Number(
                                promotion.promotional_price
                              ).toFixed(2)}`
                            : "Não informado"}
                        </p>
                      </div>

                      {promotion.banner_url && (
                        <div className="mt-4">
                          <img
                            src={promotion.banner_url}
                            alt={promotion.title}
                            className="w-full max-w-md h-40 object-cover rounded-xl border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:w-52 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(promotion)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(promotion)}
                        className={`w-full px-4 py-3 rounded-xl font-medium transition text-white ${
                          promotion.active
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {promotion.active ? "Desativar" : "Ativar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(promotion.id)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}