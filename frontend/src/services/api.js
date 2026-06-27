const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = {
  async request(path, options = {}) {
    const isFormData = options.body instanceof FormData
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(localStorage.getItem('aria-token')
          ? { Authorization: `Bearer ${localStorage.getItem('aria-token')}` }
          : {}),
        ...options.headers,
      },
      ...options,
    })

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

  delete(path) {
    return this.request(path, { method: 'DELETE' })
  },
}

export default api
