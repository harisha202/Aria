export const StorageUtils = {
  getItem(key, fallback = null) {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  },

  setItem(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
    return value
  },

  removeItem(key) {
    window.localStorage.removeItem(key)
  },

  clear() {
    window.localStorage.clear()
  },

  getAllKeys() {
    return Object.keys(window.localStorage)
  },
}

export default StorageUtils
