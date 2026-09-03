import axios from "axios"

export const api = axios.create({
  baseURL: "/",
  timeout: 10000,
  headers: { "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})