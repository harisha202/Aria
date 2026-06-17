import { useState } from 'react'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)
    try {
      setUser({ email, passwordSet: Boolean(password) })
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setIsLoading(true)
    setError(null)
    try {
      setUser({ name, email, passwordSet: Boolean(password) })
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
  }

  return { user, isLoading, error, login, signup, logout }
}
