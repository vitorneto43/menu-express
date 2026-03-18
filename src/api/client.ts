import axios from "axios"

const api = axios.create({
  baseURL: "https://menu-express-nu.vercel.app",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

export default api
