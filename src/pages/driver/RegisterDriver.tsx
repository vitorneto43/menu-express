import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import { createCourier, getCourierByUserId } from "../../api/couriers"
import { onboardCourier } from "../../api/stripe"

export default function RegisterDriver() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [vehicle, setVehicle] = useState("")

  const [bank, setBank] = useState("")
  const [accountType, setAccountType] = useState("")
  const [agency, setAgency] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [document, setDocument] = useState("")

  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  useEffect(() => {
    async function checkExistingCourier() {
      try {
        const savedUser = localStorage.getItem("user")
        if (!savedUser) return

        const user = JSON.parse(savedUser)
        if (!user?.id) return

        const courier = await getCourierByUserId(Number(user.id))

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            courierProfile: courier,
          })
        )

        navigate("/driver/dashboard")
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          console.error("Erro ao verificar entregador:", error)
        }
      }
    }

    checkExistingCourier()
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSubmitting(true)

      const savedUser = localStorage.getItem("user")
      if (!savedUser) {
        alert("Você precisa estar logado")
        return
      }

      const user = JSON.parse(savedUser)

      const driver = await createCourier({
        user_id: user.id,
        name,
        phone,
        vehicle,
        bank,
        account_type: accountType,
        agency,
        account_number: accountNumber,
        pix_key: pixKey,
        document,
        photo,
      })

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          courierProfile: driver,
        })
      )

      const stripeData = await onboardCourier(driver.id)

      if (stripeData?.onboarding_url) {
        window.location.href = stripeData.onboarding_url
        return
      }

      navigate("/driver/dashboard")
    } catch (error: any) {
      console.error("Erro ao cadastrar entregador:", error)
      console.error("response:", error?.response)
      console.error("response.data:", error?.response?.data)

      const detail = error?.response?.data?.detail

      if (detail) {
        alert(typeof detail === "string" ? detail : JSON.stringify(detail))
      } else {
        alert("Erro ao cadastrar entregador")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-3xl font-bold mb-6">
            Cadastro de Entregador
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium">Nome</label>
              <input
                type="text"
                className="border w-full p-3 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Telefone</label>
              <input
                type="text"
                className="border w-full p-3 rounded"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Veículo</label>
              <select
                className="border w-full p-3 rounded"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="moto">Moto</option>
                <option value="bike">Bicicleta</option>
                <option value="carro">Carro</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Foto de perfil
              </label>

              <input
                type="file"
                accept="image/*"
                className="border w-full p-3 rounded"
                onChange={handlePhotoChange}
              />

              {preview && (
                <img
                  src={preview}
                  alt="Pré-visualização"
                  className="w-32 h-32 rounded-full mt-4 object-cover border"
                />
              )}
            </div>

            <h2 className="text-xl font-bold pt-6">
              Dados bancários
            </h2>

            <div>
              <label className="block mb-2 font-medium">Banco</label>
              <input
                type="text"
                className="border w-full p-3 rounded"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Tipo de conta</label>
              <select
                className="border w-full p-3 rounded"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="corrente">Conta Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Agência</label>
              <input
                type="text"
                className="border w-full p-3 rounded"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Conta</label>
              <input
                type="text"
                className="border w-full p-3 rounded"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Chave PIX</label>
              <input
                type="text"
                className="border w-full p-3 rounded"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">CPF</label>
              <input
                type="text"
                className="border w-full p-3 rounded"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-3 rounded font-semibold"
            >
              {submitting ? "Cadastrando..." : "Cadastrar entregador"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
