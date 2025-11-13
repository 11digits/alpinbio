import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://plati.alpinbio.ro/api',
  headers: {
    Accept: 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY || '1111-2222-3333-4444'
  if (apiKey) {
    config.headers['x-api-key'] = apiKey
  }
  return config
})

export function getErrorMessage(error, fallback = 'A apărut o eroare. Vă rugăm să încercați din nou.') {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.message) {
    return error.message
  }

  return fallback
}

export default api
