// plugins/axios.js
import axios from "axios"

const api = axios.create({
  baseURL: "https://app.totalclean.ro/api/v1/ttctrack",
  timeout: 5000,
  headers: {
    'Apikey': 'XHF3D-SSE4R-21323-A2SFF'
  }
})

export default {
  install(app) {
    app.config.globalProperties.$axios = api
  }
}

export { api } // optional if you want to import directly
