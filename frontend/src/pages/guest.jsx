import { useCallback, useEffect, useState } from 'react'
import { ROUTES } from '../utils/constants'

function VerifyGuest({ navigate }) {
  const [status, setStatus] = useState('verifying') // verifying, success, error, expired
  const [message, setMessage] = useState('')

  const verifyEmail = useCallback(async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search)
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link. No token provided.')
        return
      }

      const response = await fetch(`/api/auth/verify-guest/${token}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
      } else if (response.status === 410) {
        setStatus('expired')
        setMessage(data.detail)
      } else {
        setStatus('error')
        setMessage(data.detail || 'Email verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please check your connection.')
      console.error('Verification error:', error)
    }
  }, [navigate])

  useEffect(() => {
    verifyEmail()
  }, [verifyEmail])

  return (
    <main className="verify-page">
      <div className="verify-container">
        <div className={`verify-card status-${status}`}>
          {/* Verifying State */}
          {status === 'verifying' && (
            <>
              <div className="verify-spinner"></div>
              <h1>Verifying Your Email</h1>
              <p>Please wait while we confirm your email address...</p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="verify-icon success">✓</div>
              <h1>Email Verified!</h1>
              <p>{message}</p>
              <div className="verify-footer">
                <p className="redirect-text">
                  Guest verification is complete.
                </p>
                <button 
                  className="continue-button"
                  onClick={() => navigate(ROUTES.WELCOME)}
                >
                  Back to Welcome
                </button>
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="verify-icon error">✗</div>
              <h1>Verification Failed</h1>
              <p>{message}</p>
              <div className="verify-footer">
                <p className="error-message">
                  Something went wrong. Please try again or contact support.
                </p>
                <div className="verify-actions">
                  <button 
                    className="back-button"
                    onClick={() => navigate(ROUTES.WELCOME)}
                  >
                    Back to Welcome
                  </button>
                  <button 
                    className="retry-button"
                    onClick={verifyEmail}
                  >
                    Retry Verification
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <>
              <div className="verify-icon warning">⏱</div>
              <h1>Link Expired</h1>
              <p>{message}</p>
              <div className="verify-footer">
                <p className="warning-message">
                  Your confirmation link has expired. Please sign up again to receive a new one.
                </p>
                <button 
                  className="signup-button"
                  onClick={() => navigate(ROUTES.WELCOME)}
                >
                  Sign Up Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .verify-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);
        }

        .verify-container {
          max-width: 450px;
          width: 100%;
        }

        .verify-card {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
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

        .verify-card h1 {
          font-size: 1.75rem;
          color: #1a1a1a;
          margin: 1.5rem 0 0.5rem;
          font-weight: 600;
        }

        .verify-card p {
          font-size: 1rem;
          color: #666;
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        /* Spinner Animation */
        .verify-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Icons */
        .verify-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin: 0 auto 1.5rem;
          animation: popIn 0.5s ease;
        }

        @keyframes popIn {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .verify-icon.success {
          background: #d1fae5;
          color: #059669;
        }

        .verify-icon.error {
          background: #fee2e2;
          color: #dc2626;
        }

        .verify-icon.warning {
          background: #fef3c7;
          color: #d97706;
        }

        /* Footer Messages */
        .verify-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f0f0f0;
        }

        .redirect-text {
          font-size: 0.95rem;
          color: #999;
          margin-bottom: 1rem;
        }

        .error-message,
        .warning-message {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 1.5rem;
        }

        /* Buttons */
        .continue-button,
        .signup-button {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 1rem;
        }

        .continue-button:hover,
        .signup-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
        }

        .verify-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .back-button,
        .retry-button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #ddd;
          background: white;
        }

        .back-button {
          color: #666;
        }

        .retry-button {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .back-button:hover {
          background: #f9f9f9;
          border-color: #999;
        }

        .retry-button:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .verify-card {
            padding: 2rem;
          }

          .verify-card h1 {
            font-size: 1.5rem;
          }

          .verify-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  )
}

export default VerifyGuest
