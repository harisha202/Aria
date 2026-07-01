/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import AuthService from '../services/auth.service'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('aria-user')
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem('aria-user')
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('aria-token') || '')
  const [isLoading, setIsLoading] = useState(false)
  const isAuthenticated = Boolean(user && (token || user.method === 'guest'))

  const persistAuth = useCallback((result) => {
    const nextUser = result.user || result
    setUser(nextUser)
    localStorage.setItem('aria-user', JSON.stringify(nextUser))

    if (result.access_token) {
      setToken(result.access_token)
      localStorage.setItem('aria-token', result.access_token)
    } else {
      setToken('')
      localStorage.removeItem('aria-token')
    }

    return result
  }, [])

  const login = useCallback(async (emailOrUser, password) => {
    setIsLoading(true)
    try {
      const result =
        typeof emailOrUser === 'string'
          ? await AuthService.login(emailOrUser, password)
          : emailOrUser?.user || emailOrUser?.access_token
            ? emailOrUser
            : { user: emailOrUser }
      return persistAuth(result)
    } finally {
      setIsLoading(false)
    }
  }, [persistAuth])

  const signup = useCallback(async (userData) => {
    setIsLoading(true)
    try {
      const result = userData.password
        ? await AuthService.signup(userData)
        : { user: userData }
      return persistAuth(result)
    } finally {
      setIsLoading(false)
    }
  }, [persistAuth])

  const loginAsGuest = useCallback((guestData) => {
    const guestUser = {
      id: 'guest',
      email: guestData.email,
      name: guestData.name,
      method: 'guest'
    }
    setUser(guestUser)
    setToken('')
    localStorage.setItem('aria-user', JSON.stringify(guestUser))
    localStorage.removeItem('aria-token')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken('')
    localStorage.removeItem('aria-user')
    localStorage.removeItem('aria-token')
  }, [])

  const value = useMemo(
    () => ({ user, token, isAuthenticated, isLoading, login, signup, loginAsGuest, logout }),
    [user, token, isAuthenticated, isLoading, login, signup, loginAsGuest, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider')
  }
  return context
}
