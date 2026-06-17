/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const isAuthenticated = Boolean(user)

  const login = (userData) => {
    setUser(userData)
  }

  const signup = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, isAuthenticated, login, signup, logout }),
    [user, isAuthenticated],
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
