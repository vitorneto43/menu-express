import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useCartStore } from "../store/cartStore"
import { createOrder } from "../api/orders"
import { createCheckoutSession } from "../api/checkout"
import { createPixPayment } from "../api/pix"
import { getRestaurantById } from "../api/restaurants"

type Address = {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  cep: string
  complement: string
  reference: string
  latitude?: number | null
  longitude?: number | null
}

type Restaurant = {
  id: number
  name: string
  delivery_fee: number | string
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalPrice, restaurantId, clearCart } = useCartStore()

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  const savedAddress = localStorage.getItem("customer_address")

  const [address, setAddress] = useState<Address>(
    savedAddress
      ? JSON.parse(savedAddress)
      : {
          street: "",
          number: "",
          neighborhood: "",
          city: "",
          state: "",
          cep: "",
          complement: "",
          reference: "",
          latitude: null,
          longitude: null,
        }
  )

  const [deliveryLatitude, setDeliveryLatitude] = useState<number | null>(
    savedAddress ? JSON.parse(savedAddress).latitude ?? null : null
  )
  const [deliveryLongitude, setDeliveryLongitude] = useState<number | null>(
    savedAddress ? JSON.parse(savedAddress).longitude ?? null : null
  )

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        if (!restaurantId) return
        const data = await getRestaurantById(restaurantId)
        setRestaurant(data)
      } catch (err) {
        console.error("Erro ao buscar restaurante:", err)
        setError("Não foi possível carregar a taxa de entrega do restaurante")
      }
    }

    fetchRestaurant()
  }, [restaurantId])

  const deliveryFee = Number(restaurant?.delivery_fee || 0)
  const subtotal = totalPrice()
  const total = subtotal + (items.length > 0 ? deliveryFee : 0)

  function handleAddressChange(field: keyof Address, value: string) {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function validateAddress() {
    if (
      !address.street.trim() ||
      !address.number.trim() ||
      !address.neighborhood.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.cep.trim()
    ) {
      setError("Preencha todos os campos obrigatórios do endereço")
      return false
    }

    return true
  }

  function getDeliveryLocation() {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLatitude(position.coords.latitude)
        setDeliveryLongitude(position.coords.longitude)
        alert("Localização de entrega capturada com sucesso")
      },
      (geoError) => {
        console.error(geoError)
        alert("Não foi possível obter a localização da entrega")
      }
    )
  }

  async function handleStripeCheckout(orderId: number) {
    const data = await createCheckoutSession(orderId)

    if (!data?.checkout_url) {
      throw new Error("checkout_url não retornado pela API")
    }

    localStorage.setItem("pending_order_id", String(orderId))
    window.location.href = data.checkout_url
  }

  async function handlePixPayment(orderId: number) {
    const data = await createPixPayment(orderId)

    console.log("=== PIX PAYMENT ===", data)

    localStorage.setItem("pending_order_id", String(orderId))

    const hostedUrl =
      data?.hosted_instructions_url ||
      data?.pix_page_url ||
      data?.next_action?.pix_display_qr_code?.hosted_instructions_url

    if (hostedUrl) {
      window.location.href = hostedUrl
      return
    }

    throw new Error("Dados do Pix não retornados pela API")
  }

  async function handleConfirmOrder() {
    setError("")
    setMessage("")

    const savedUser = localStorage.getItem("user")

    if (!savedUser) {
      setError("Você precisa estar logado para finalizar o pedido")
      return
    }

    if (!validateAddress()) {
      return
    }

    const user = JSON.parse(savedUser)

    if (!restaurantId) {
      setError("Nenhum restaurante vinculado ao carrinho")
      return
    }

    if (!restaurant) {
      setError("Dados do restaurante ainda não carregados")
      return
    }

    if (items.length === 0) {
      setError("Seu carrinho está vazio")
      return
    }

    try {
      setLoading(true)

      localStorage.setItem(
        "customer_address",
        JSON.stringify({
          ...address,
          latitude: deliveryLatitude,
          longitude: deliveryLongitude,
        })
      )

      const payload = {
        user_id: user.id,
        restaurant_id: restaurantId,
        delivery_fee: deliveryFee,
        partner_delivery: true,
        courier_id: null,
        payment_method: paymentMethod,
        subtotal,
        total,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        delivery_address: {
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          cep: address.cep,
          complement: address.complement,
          reference: address.reference,
          latitude: deliveryLatitude,
          longitude: deliveryLongitude,
        },
      }

      const response = await createOrder(payload)

      localStorage.setItem("pending_order_id", String(response.id))

      if (paymentMethod === "card") {
        setMessage(`Pedido #${response.id} criado. Redirecionando para o pagamento...`)
        await handleStripeCheckout(response.id)
        return
      }

      if (paymentMethod === "pix") {
        setMessage(`Pedido #${response.id} criado. Gerando Pix...`)
        await handlePixPayment(response.id)
        return
      }

      clearCart()
      navigate("/meus-pedidos")
    } catch (err: any) {
      console.error("=== ERRO NO CHECKOUT ===", err)
      const detail = err?.response?.data?.detail
      setError(typeof detail === "string" ? detail : err?.message || "Erro ao finalizar pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Finalizar pedido
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">Endereço de entrega</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Rua *"
                    className="border rounded-xl px-4 py-3"
                    value={address.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Número *"
                    className="border rounded-xl px-4 py-3"
                    value={address.number}
                    onChange={(e) => handleAddressChange("number", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Bairro *"
                    className="border rounded-xl px-4 py-3"
                    value={address.neighborhood}
                    onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Cidade *"
                    className="border rounded-xl px-4 py-3"
                    value={address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Estado *"
                    className="border rounded-xl px-4 py-3"
                    value={address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="CEP *"
                    className="border rounded-xl px-4 py-3"
                    value={address.cep}
                    onChange={(e) => handleAddressChange("cep", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Complemento"
                    className="border rounded-xl px-4 py-3"
                    value={address.complement}
                    onChange={(e) => handleAddressChange("complement", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Referência"
                    className="border rounded-xl px-4 py-3"
                    value={address.reference}
                    onChange={(e) => handleAddressChange("reference", e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={getDeliveryLocation}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    📍 Usar minha localização de entrega
                  </button>

                  {deliveryLatitude && deliveryLongitude && (
                    <p className="text-sm text-green-600 mt-2">
                      Localização capturada com sucesso
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">Forma de pagamento</h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <span>Cartão de crédito</span>
                  </label>

                  <label className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "pix"}
                      onChange={() => setPaymentMethod("pix")}
                    />
                    <span>Pix</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 h-fit">
              <h2 className="text-2xl font-bold mb-4">Resumo do pedido</h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.name} x{item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-700">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-4 space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Entrega</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {message && <p className="text-green-600 text-sm mt-4">{message}</p>}
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

              <button
                onClick={handleConfirmOrder}
                disabled={loading || !restaurant}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-xl font-semibold mt-6 transition"
              >
                {loading ? "Processando..." : !restaurant ? "Carregando taxa..." : "Confirmar pedido"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}