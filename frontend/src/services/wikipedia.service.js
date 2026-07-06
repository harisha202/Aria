import api from './api'

export const WikipediaService = {
  search: async (query) => {
    return await api.get(`/api/v1/wikipedia/search?q=${encodeURIComponent(query)}`)
  }
}
