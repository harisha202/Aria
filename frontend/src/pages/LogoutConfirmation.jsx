import { useState } from 'react'
import Button from '../components/Common/Button'
import Card from '../components/Common/Card'
import FeedbackForm from '../components/Common/FeedbackForm'
import Loading from '../components/Common/Loading'
import SettingsLogo from '../components/Settings/SettingsLogo'
import { useAuthContext } from '../context/AuthContext'
import FeedbackService from '../services/feedback.service'
import { ROUTES } from '../utils/constants'

function LogoutConfirmation({ navigate }) {
  const { user, logout } = useAuthContext()
  const [showFeedback, setShowFeedback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const finishLogout = () => {
    setIsLoading(true)
    logout()
    navigate(ROUTES.WELCOME)
  }

  const handleFeedbackSubmit = async (feedbackData) => {
    setIsLoading(true)
    setError('')
    try {
      await FeedbackService.submitFeedback({
        ...feedbackData,
        userEmail: user?.email || feedbackData.userEmail,
        userName: user?.name || feedbackData.userName,
      })
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.')
      setIsLoading(false)
      throw err
    }
  }

  const handleFeedbackClose = () => {
    setShowFeedback(false)
    finishLogout()
  }

  return (
    <main className="page modal-page">
      <div className="modal-overlay" />
      <Card className="logout-card slide-up">
        <div className="logout-brand">
          <SettingsLogo type="logout" size="xl" />
          <span>ARIA Session</span>
        </div>
        <h1>Logout?</h1>
        <p>
          Before you logout{user?.name ? `, ${user.name}` : ''}, please share quick feedback about ARIA.
        </p>
        {error && <span className="error-message otp-error">{error}</span>}
        {isLoading && !showFeedback ? (
          <Loading message="Opening welcome..." />
        ) : (
          <div className="modal-actions">
            <Button text="Yes, Logout" onClick={() => setShowFeedback(true)} disabled={isLoading} />
            <Button text="Cancel" variant="secondary" onClick={() => navigate(ROUTES.CHAT)} disabled={isLoading} />
          </div>
        )}
        <p className="logout-note">You can also provide feedback later from settings.</p>
      </Card>
      <FeedbackForm
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
        userName={user?.name || 'User'}
        userEmail={user?.email || 'guest@aria.local'}
      />
    </main>
  )
}

export default LogoutConfirmation
