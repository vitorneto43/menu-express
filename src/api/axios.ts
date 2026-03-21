import axios from "axios"

const api = axios.create({
  baseURL: "https://menuexpress.delivery/api",
})

export default api