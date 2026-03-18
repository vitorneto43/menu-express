import { useEffect, useState } from "react"
import RestaurantPanelLayout from "../../components/RestaurantPanelLayout"
import { createProduct, getProductsByRestaurant } from "../../api/products"

type Product = {
  id: number
  name: string
  description: string
  price: string
  category: string
  available: boolean
  image: string | null
}

export default function RestaurantMenu() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("Hambúrgueres")
  const [available, setAvailable] = useState(true)
  const [image, setImage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  function resetForm() {
    setName("")
    setDescription("")
    setPrice("")
    setCategory("Hambúrgueres")
    setAvailable(true)
    setImage(null)
    setEditingId(null)
  }

  function getLoggedRestaurantId() {
    const savedUser = localStorage.getItem("user")
    if (!savedUser) return null

    const user = JSON.parse(savedUser)
    return user?.restaurantProfile?.id || null
  }

  async function loadProducts() {
    try {
      const restaurantId = getLoggedRestaurantId()

      if (!restaurantId) {
        alert("Restaurante não encontrado para este usuário.")
        setLoading(false)
        return
      }

      const data = await getProductsByRestaurant(restaurantId)

      const formatted = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: String(item.price).replace(".", ","),
        category: item.category || "Hambúrgueres",
        available: item.available ?? true,
        image: item.image || null,
      }))

      setProducts(formatted)
    } catch (error) {
      console.error(error)
      alert("Erro ao carregar cardápio")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const imageUrl = URL.createObjectURL(file)
    setImage(imageUrl)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name || !description || !price) {
      alert("Preencha nome, descrição e preço.")
      return
    }

    const restaurantId = getLoggedRestaurantId()

    if (!restaurantId) {
      alert("Restaurante não encontrado para este usuário.")
      return
    }

    if (editingId) {
      alert("Edição ainda não conectada à API.")
      return
    }

    try {
      await createProduct({
        restaurant_id: restaurantId,
        name,
        description,
        price: Number(price.replace(",", ".")),
        image,
        category,
        available,
      })

      await loadProducts()
      resetForm()
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar produto")
    }
  }

  function handleEditProduct(product: Product) {
    setEditingId(product.id)
    setName(product.name)
    setDescription(product.description)
    setPrice(product.price)
    setCategory(product.category)
    setAvailable(product.available)
    setImage(product.image)
  }

  function handleDeleteProduct(id: number) {
    alert("Exclusão ainda não conectada à API.")
    if (editingId === id) resetForm()
  }

  function handleToggleAvailability(id: number) {
    alert("Ativar/desativar ainda não conectado à API.")
  }

  return (
    <RestaurantPanelLayout title="Cardápio do Restaurante">
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Editar prato" : "Cadastrar novo prato"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome do prato"
            className="border rounded-xl px-4 py-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="border rounded-xl px-4 py-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Hambúrgueres</option>
            <option>Bebidas</option>
            <option>Sobremesas</option>
            <option>Pizza</option>
            <option>Marmitas</option>
            <option>Açaí</option>
          </select>

          <textarea
            placeholder="Descrição do prato"
            className="border rounded-xl px-4 py-3 md:col-span-2 min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="text"
            placeholder="Preço ex: 29,90"
            className="border rounded-xl px-4 py-3"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <label className="flex items-center gap-3 border rounded-xl px-4 py-3">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
            <span>Disponível para pedidos</span>
          </label>

          <div className="md:col-span-2">
            <label className="block font-medium mb-2">Imagem do prato</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded-xl px-4 py-3"
              onChange={handleImageChange}
            />
          </div>

          {image && (
            <div className="md:col-span-2">
              <p className="font-medium mb-2">Prévia da imagem</p>
              <img
                src={image}
                alt="Prévia"
                className="w-40 h-40 object-cover rounded-xl border"
              />
            </div>
          )}

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-5 py-3 font-semibold"
            >
              {editingId ? "Salvar alterações" : "Adicionar prato"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 rounded-xl px-5 py-3 font-semibold"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Pratos cadastrados</h2>

        {loading ? (
          <p className="text-gray-500">Carregando cardápio...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">Nenhum prato cadastrado ainda.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="flex gap-4">
                  <img
                    src={
                      product.image ||
                      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
                    }
                    alt={product.name}
                    className="w-28 h-28 object-cover rounded-xl"
                  />

                  <div>
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <p className="text-gray-700 mt-1">{product.description}</p>
                    <p className="text-red-500 font-bold mt-2">R$ {product.price}</p>

                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                        product.available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {product.available ? "Disponível" : "Indisponível"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleToggleAvailability(product.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                  >
                    {product.available ? "Desativar" : "Ativar"}
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RestaurantPanelLayout>
  )
}