const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Redirects to /login and clears stored auth when the server returns 401.
 * Uses a debounce flag so multiple concurrent 401s only trigger one redirect.
 */
let _redirecting = false
function handleUnauthorized() {
  if (_redirecting) return
  _redirecting = true
  localStorage.removeItem('aria-token')
  localStorage.removeItem('aria-user')
  window.history.pushState({}, '', '/login')
  window.dispatchEvent(new PopStateEvent('popstate'))
  setTimeout(() => { _redirecting = false }, 2000)
}

export const api = {
  async request(path, options = {}) {
    const isFormData = options.body instanceof FormData
    const token = localStorage.getItem('aria-token')

    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })

    // Auto-logout on expired / invalid token
    if (response.status === 401) {
      handleUnauthorized()
      throw new Error('Session expired. Please log in again.')
    }

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`
      try {
        const data = await response.json()
        message = data.detail || data.message || message
      } catch {
        // Keep the status message when the response body is not JSON.
      }
      throw new Error(message)
    }

    return response.json()
  },

  get(path) {
    return this.request(path)
  },

  post(path, data, options = {}) {
    return this.request(path, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    })
  },

  patch(path, data) {
    return this.request(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  put(path, data) {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(path) {
    return this.request(path, { method: 'DELETE' })
  },
}

export default api
