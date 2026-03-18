import api from "./axios"

// criar entregador
export async function createCourier(data: any) {
  const formData = new FormData()

  formData.append("user_id", data.user_id)
  formData.append("name", data.name)
  formData.append("phone", data.phone)
  formData.append("vehicle", data.vehicle)
  formData.append("bank", data.bank)
  formData.append("account_type", data.account_type)
  formData.append("agency", data.agency)
  formData.append("account_number", data.account_number)
  formData.append("pix_key", data.pix_key)
  formData.append("document", data.document)

  if (data.photo) {
    formData.append("photo", data.photo)
  }

  const response = await api.post("/couriers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}


// 👇 ESTA FUNÇÃO FALTAVA
export async function getCourierByUserId(userId: number) {
  const response = await api.get(`/couriers/user/${userId}`)
  return response.data
}
