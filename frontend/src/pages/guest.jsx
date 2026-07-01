import { useState } from 'react'
import AiraLogo from '../components/AiraLogo'
import FloatingLines from '../components/Backgrounds/FloatingLines'
import { useAuthContext } from '../context/AuthContext'
import { ROUTES } from '../utils/constants'
import { validateEmail, validateName } from '../utils/validators'

function GuestAccessForm({ navigate }) {
  const { login } = useAuthContext()
  const [guestData, setGuestData] = useState({
    fullName: '',
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setGuestData({ ...guestData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (!validateName(guestData.fullName)) {
      setMessage({ type: 'error', text: 'Full name is required' })
      return
    }
    if (!validateEmail(guestData.email)) {
      setMessage({ type: 'error', text: 'Enter a valid email address' })
      return
    }

    setLoading(true)
    setMessage({
      type: 'success',
      text: 'Welcome! Entering ARIA...',
    })

    window.setTimeout(() => {
      const guestId = `guest-${Date.now()}`
      login({
        id: guestId,
        name: guestData.fullName,
        email: guestData.email,
        phone: guestData.phone,
        method: 'guest',
      })
      setLoading(false)
      navigate(ROUTES.CHAT, {
        state: { guestId, name: guestData.fullName },
      })
    }, 650)
  }

  return (
    <main className="guest-page">
      <div className="guest-background" aria-hidden="true">
        <FloatingLines
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={8}
          lineDistance={39.5}
          bendRadius={8}
          bendStrength={1.5}
          interactive
          parallax
          animationSpeed={2.3}
          gradientStart="#06B6D4"
          gradientMid="#06B6D4"
          gradientEnd="#10B981"
        />
      </div>
      <div className="guest-container">
        <div className="guest-card">
          {/* Header */}
          <div className="guest-header">
            <div className="guest-logo-circle">
              <AiraLogo className="guest-logo-canvas" width={400} height={380} />
            </div>
            <h1>Guest Access</h1>
            <p>Explore ARIA with read-only access. No account needed.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="guest-form">
            {/* Full Name Input */}
            <div className="form-field">
              <label htmlFor="fullName">FULL NAME</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={guestData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={loading}
                required
              />
            </div>

            {/* Email Input */}
            <div className="form-field">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <input
                id="email"
                type="email"
                name="email"
                value={guestData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                disabled={loading}
                required
              />
            </div>

            {/* Phone Input */}
            <div className="form-field">
              <label htmlFor="phone">PHONE NUMBER</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={guestData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                disabled={loading}
              />
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.type === 'success' && '✓ '}
                {message.type === 'error' && '✗ '}
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-continue"
              disabled={loading}
            >
              {loading ? 'Creating Access...' : 'Continue as Guest'}
            </button>

            {/* Login Link */}
            <div className="form-footer">
              <button
                type="button"
                className="btn-back-link"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Already have an account?
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .guest-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
          overflow: hidden;
          isolation: isolate;
        }

        .guest-background {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(circle at 18% 18%, rgba(6, 182, 212, 0.18), transparent 30%),
            linear-gradient(135deg, #030712 0%, #07111f 48%, #02140f 100%);
        }

        .guest-background::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(3, 7, 18, 0.38), rgba(3, 7, 18, 0.08) 48%, rgba(3, 7, 18, 0.32));
          pointer-events: none;
        }

        .guest-container {
          width: 100%;
          max-width: 500px;
          position: relative;
          z-index: 1;
        }

        .guest-card {
          background: linear-gradient(180deg, rgba(26, 26, 46, 0.86) 0%, rgba(22, 33, 62, 0.86) 100%);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header Section */
        .guest-header {
          text-align: center;
          padding: 2.5rem 2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .guest-logo-circle {
          width: 82px;
          height: 78px;
          margin: 0 auto 1.5rem;
          background: #030d1a;
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 14px 34px rgba(6, 182, 212, 0.16);
        }

        .guest-logo-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .guest-header h1 {
          font-size: 1.75rem;
          color: white;
          margin-bottom: 0.5rem;
          font-weight: 600;
          letter-spacing: -0.5px;
        }

        .guest-header p {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }

        /* Form Section */
        .guest-form {
          padding: 2rem;
        }

        .form-field {
          margin-bottom: 1.5rem;
        }

        .form-field label {
          display: block;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .form-field input {
          width: 100%;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-field input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-field input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }

        .form-field input:disabled {
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.4);
          cursor: not-allowed;
        }

        /* Alert Messages */
        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.1);
          color: #86efac;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        /* Continue Button */
        .btn-continue {
          width: 100%;
          padding: 0.9rem;
          background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2);
        }

        .btn-continue:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3);
        }

        .btn-continue:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-continue:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Login Link */
        .form-footer {
          text-align: center;
        }

        .btn-back-link {
          width: 100%;
          min-height: 46px;
          padding: 0.8rem 1rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.34);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 700;
          transition: all 0.3s ease;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(6, 182, 212, 0.14);
        }

        .btn-back-link:hover {
          border-color: rgba(6, 182, 212, 0.58);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(6, 182, 212, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .guest-page {
            padding: 1rem;
          }

          .guest-card {
            border-radius: 12px;
          }

          .guest-header {
            padding: 2rem 1.5rem 1rem;
          }

          .guest-header h1 {
            font-size: 1.5rem;
          }

          .guest-form {
            padding: 1.5rem;
          }

          .form-field {
            margin-bottom: 1.25rem;
          }

          .form-field label {
            font-size: 0.75rem;
            margin-bottom: 0.5rem;
          }

          .form-field input {
            padding: 0.75rem 0.875rem;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 360px) {
          .guest-header {
            padding: 1.5rem 1rem 0.75rem;
          }

          .guest-logo-circle {
            width: 70px;
            height: 66px;
            margin-bottom: 1rem;
          }

          .guest-header h1 {
            font-size: 1.35rem;
          }

          .guest-header p {
            font-size: 0.85rem;
          }

          .guest-form {
            padding: 1.25rem;
          }

        }
      `}</style>
    </main>
  )
}

export default GuestAccessForm
