/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'

const UIContext = createContext(null)

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [notifications, setNotifications] = useState([])

  const pushNotification = (notification) => {
    setNotifications((current) => [...current, { id: Date.now(), ...notification }])
  }

  const value = useMemo(
    () => ({ sidebarOpen, setSidebarOpen, theme, setTheme, notifications, setNotifications, pushNotification }),
    [notifications, sidebarOpen, theme],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export const useUIContext = () => {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUIContext must be used inside UIProvider')
  }
  return context
}

export default UIContext
