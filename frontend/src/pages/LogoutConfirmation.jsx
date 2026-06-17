import Button from '../components/Common/Button'
import Card from '../components/Common/Card'
import { useAuthContext } from '../context/AuthContext'
import { ROUTES } from '../utils/constants'

function LogoutConfirmation({ navigate }) {
  const { logout } = useAuthContext()
  return (
    <main className="page modal-page">
      <div className="modal-overlay" />
      <Card className="logout-card slide-up">
        <h1>Logout?</h1>
        <p>Are you sure you want to logout?</p>
        <div className="modal-actions">
          <Button
            text="Yes, Logout"
            onClick={() => {
              logout()
              navigate(ROUTES.WELCOME)
            }}
          />
          <Button text="Cancel" variant="secondary" onClick={() => navigate(ROUTES.CHAT)} />
        </div>
      </Card>
    </main>
  )
}

export default LogoutConfirmation
