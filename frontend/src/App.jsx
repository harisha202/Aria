import { useEffect, useState } from 'react'
import Login from './pages/Login'
import LogoutConfirmation from './pages/LogoutConfirmation'
import OTPVerification from './pages/OTPVerification'
import SignUp from './pages/SignUp'
import ChatPage from './pages/chatpage'
import DashboardPage from './pages/dashboard'
import VerifyGuest from './pages/guest'
import SettingsPage from './pages/settings'
import Welcome from './pages/Welcome'
import { ChatProvider } from './context/ChatContext'
import { useAuthContext } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import { VoiceProvider } from './context/VoiceContext'
import { ROUTES } from './utils/constants'
import './App.css'

const getRoute = () => window.location.pathname

function AppRoutes() {
  const { user, isAuthenticated, loginAsGuest } = useAuthContext()
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const handleRouteChange = () => setRoute(getRoute())
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const navigate = (path, options = {}) => {
    window.history.pushState(options.state ?? {}, '', path)
    setRoute(getRoute())
  }

  const pageProps = { navigate, user }
  const protectedRoutes = [ROUTES.CHAT, ROUTES.DASHBOARD, ROUTES.SETTINGS, ROUTES.LOGOUT]

  if (protectedRoutes.includes(route) && !isAuthenticated) {
    return <Login navigate={navigate} />
  }

  if (route === ROUTES.LOGIN) return <Login navigate={navigate} />
  if (route === ROUTES.SIGNUP) return <SignUp navigate={navigate} />
  if (route === ROUTES.OTP) return <OTPVerification navigate={navigate} />
  if (route === ROUTES.GUEST) return <VerifyGuest navigate={navigate} />
  if (route === ROUTES.LOGOUT) return <LogoutConfirmation navigate={navigate} />
  if (route === ROUTES.DASHBOARD) return <DashboardPage {...pageProps} />
  if (route === ROUTES.CHAT) return <ChatPage {...pageProps} />
  if (route === ROUTES.SETTINGS) return <SettingsPage {...pageProps} />
  if (route !== ROUTES.WELCOME) {
    return (
      <main className="page placeholder-page">
        <h1>404 - Page Not Found</h1>
        <button type="button" onClick={() => navigate(ROUTES.WELCOME)}>
          Back to ARIA
        </button>
      </main>
    )
  }

  return <Welcome navigate={navigate} />
}

function App() {
  return (
    <ChatProvider>
      <UIProvider>
        <VoiceProvider>
          <AppRoutes />
        </VoiceProvider>
      </UIProvider>
    </ChatProvider>
  )
}

export default App
