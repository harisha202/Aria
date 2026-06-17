import { useEffect, useState } from 'react'
import Login from './pages/Login'
import LogoutConfirmation from './pages/LogoutConfirmation'
import OTPVerification from './pages/OTPVerification'
import SignUp from './pages/SignUp'
import Welcome from './pages/Welcome'
import { useAuthContext } from './context/AuthContext'
import { ROUTES } from './utils/constants'
import './App.css'

const getRoute = () => window.location.pathname

function App() {
  const { user, logout } = useAuthContext()
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const handleRouteChange = () => setRoute(getRoute())
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setRoute(path)
  }

  if (route === ROUTES.LOGIN) return <Login navigate={navigate} />
  if (route === ROUTES.SIGNUP) return <SignUp navigate={navigate} />
  if (route === ROUTES.OTP) return <OTPVerification navigate={navigate} />
  if (route === ROUTES.LOGOUT) return <LogoutConfirmation navigate={navigate} />
  if (route === ROUTES.CHAT) {
    return (
      <main className="page placeholder-page">
        <h1>ARIA Chat</h1>
        <p>{user?.email ? `Signed in as ${user.email}` : 'Guest session ready.'}</p>
        <button type="button" onClick={() => navigate(ROUTES.LOGOUT)}>
          Logout
        </button>
      </main>
    )
  }
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

  return <Welcome navigate={navigate} onGuest={() => logout()} />
}

export default App
