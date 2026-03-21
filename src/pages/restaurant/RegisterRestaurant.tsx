import { useState } from "react"
import { useNavigate } from "react-router-dom"
import RestaurantPanelLayout from "../../components/RestaurantPanelLayout"
import { createRestaurant } from "../../api/restaurants"

export default function RegisterRestaurant() {
  const navigate = useNavigate()

  const [restaurantName, setRestaurantName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [deliveryFee, setDeliveryFee] = useState("")
  const [category, setCategory] = useState("")

  const [addressStreet, setAddressStreet] = useState("")
  const [addressNumber, setAddressNumber] = useState("")
  const [addressNeighborhood, setAddressNeighborhood] = useState("")
  const [addressCity, setAddressCity] = useState("")
  const [addressState, setAddressState] = useState("")
  const [addressCep, setAddressCep] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  const [pixKey, setPixKey] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountType, setAccountType] = useState("")
  const [agency, setAgency] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const savedUser = localStorage.getItem("user")
    if (!savedUser) {
      setError("Você precisa estar logado")
      return
    }

    const user = JSON.parse(savedUser)

    try {
      setLoading(true)

      const restaurant = await createRestaurant({
        user_id: user.id,
        name: restaurantName,
        owner_name: ownerName,
        description,
        phone,
        category,

        address_street: addressStreet,
        address_number: addressNumber,
        address_neighborhood: addressNeighborhood,
        address_city: addressCity,
        address_state: addressState,
        address_cep: addressCep,
        latitude,
        longitude,

        delivery_fee: deliveryFee,
        bank_name: bankName,
        account_type: accountType,
        agency,
        account_number: accountNumber,
        pix_key: pixKey,
        document_number: documentNumber,
      })

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          role: "restaurant",
          restaurantProfile: restaurant,
        })
      )

      navigate("/restaurant/dashboard")
    } catch (err: any) {
      console.error(err)
      console.log("DETAIL:", err?.response?.data)
      setError("Erro ao cadastrar restaurante")
    } finally {
      setLoading(false)
    }
  }
  function getLocation() {
      if (!navigator.geolocation) {
        alert("Geolocalização não suportada")
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString())
          setLongitude(position.coords.longitude.toString())
        },
        () => {
          alert("Não foi possível obter localização")
        }
      )
    }

  return (
    <RestaurantPanelLayout title="Cadastro do Restaurante">
      <div className="bg-white rounded-xl shadow p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome do restaurante"
            className="w-full border p-3 rounded"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
          />


          <input
            type="text"
            placeholder="Nome do responsável"
            className="w-full border p-3 rounded"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Descrição"
            className="w-full border p-3 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="text"
            placeholder="Telefone"
            className="w-full border p-3 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <select
            className="w-full border p-3 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Selecione a categoria do restaurante</option>
            <option value="Hamburguer">Hamburguer</option>
            <option value="Pizza">Pizza</option>
            <option value="Sushi">Sushi</option>
            <option value="Comida Chinesa">Comida Chinesa</option>
            <option value="Japonesa">Japonesa</option>
            <option value="Açaí">Açaí</option>
            <option value="Marmita">Marmita</option>
            <option value="Lanches">Lanches</option>
            <option value="Doces">Doces</option>
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="Taxa de entrega"
            className="w-full border p-3 rounded"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
          />

          <h2 className="text-xl font-bold pt-4">Endereço do restaurante</h2>

          <input
            type="text"
            placeholder="Rua"
            className="w-full border p-3 rounded"
            value={addressStreet}
            onChange={(e) => setAddressStreet(e.target.value)}
          />

          <input
            type="text"
            placeholder="Número"
            className="w-full border p-3 rounded"
            value={addressNumber}
            onChange={(e) => setAddressNumber(e.target.value)}
          />

          <input
            type="text"
            placeholder="Bairro"
            className="w-full border p-3 rounded"
            value={addressNeighborhood}
            onChange={(e) => setAddressNeighborhood(e.target.value)}
          />

          <input
            type="text"
            placeholder="Cidade"
            className="w-full border p-3 rounded"
            value={addressCity}
            onChange={(e) => setAddressCity(e.target.value)}
          />

          <input
            type="text"
            placeholder="Estado"
            className="w-full border p-3 rounded"
            value={addressState}
            onChange={(e) => setAddressState(e.target.value)}
          />

          <input
            type="text"
            placeholder="CEP"
            className="w-full border p-3 rounded"
            value={addressCep}
            onChange={(e) => setAddressCep(e.target.value)}
          />

          <input
            type="number"
            step="0.000001"
            placeholder="Latitude"
            className="w-full border p-3 rounded"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />

          <input
            type="number"
            step="0.000001"
            placeholder="Longitude"
            className="w-full border p-3 rounded"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
          <button
            type="button"
            onClick={getLocation}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
          📍 Obter localização automática
          </button>

          <h2 className="text-xl font-bold pt-4">Dados bancários</h2>

          <input
            type="text"
            placeholder="Banco"
            className="w-full border p-3 rounded"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />

          <select
            className="w-full border p-3 rounded"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="">Tipo de conta</option>
            <option value="corrente">Conta Corrente</option>
            <option value="poupanca">Poupança</option>
          </select>

          <input
            type="text"
            placeholder="Agência"
            className="w-full border p-3 rounded"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
          />

          <input
            type="text"
            placeholder="Número da conta"
            className="w-full border p-3 rounded"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />

          <input
            type="text"
            placeholder="Chave PIX"
            className="w-full border p-3 rounded"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
          />

          <input
            type="text"
            placeholder="CPF ou CNPJ"
            className="w-full border p-3 rounded"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white p-3 rounded disabled:bg-red-300"
          >
            {loading ? "Salvando..." : "Salvar restaurante"}
          </button>
        </form>

      </div>
    </RestaurantPanelLayout>
  )
}