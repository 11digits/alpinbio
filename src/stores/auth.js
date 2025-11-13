// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    pin: localStorage.getItem('auth_pin') || null,
    data: JSON.parse(localStorage.getItem('auth_data') || '{}') || {}
  }),
  actions: {
    setAuth(token, pin, data) {
      this.token = token
      this.pin = pin
      this.data = data
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_pin', pin)
      localStorage.setItem('auth_data', JSON.stringify(data))
    },
    clearAuth() {
      this.token = null
      this.pin = null
      this.data = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_pin')
      localStorage.removeItem('auth_data')
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token
  }
})
