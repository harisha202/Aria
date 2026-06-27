import api from './api'

export const AuthService = {
  async login(email, password) {
    return api.post('/api/v1/auth/login', { email, password })
  },

  async signup(data) {
    return api.post('/api/v1/auth/signup', data)
  },

  async verifyOtp(email, otp) {
    return api.post('/api/v1/auth/verify-otp', { email, otp })
  },

  async resendOtp(email) {
    return api.post('/api/v1/auth/resend-otp', { email })
  },

  async logout() {
    return true
  },
}

export default AuthService
