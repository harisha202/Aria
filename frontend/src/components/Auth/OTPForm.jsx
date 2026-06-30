import { useEffect, useRef, useState } from 'react'
import AiraLogo from '../AiraLogo'
import { useAuthContext } from '../../context/AuthContext'
import AuthService from '../../services/auth.service'
import { OTP_LENGTH, OTP_RESEND_TIME, ROUTES } from '../../utils/constants'
import { validateOTP } from '../../utils/validators'

function OTPForm({ email = 'email@example.com', navigate }) {
  const { user, login } = useAuthContext()
  const displayEmail = user?.email || email
  const [digits, setDigits] = useState(Array.from({ length: OTP_LENGTH }, () => ''))
  const [timer, setTimer] = useState(OTP_RESEND_TIME)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputsRef = useRef([])

  useEffect(() => {
    if (!user?.email && email === 'email@example.com') {
      navigate(ROUTES.SIGNUP)
    }
  }, [email, navigate, user?.email])

  useEffect(() => {
    if (timer <= 0) return undefined
    const intervalId = window.setInterval(() => setTimer((current) => current - 1), 1000)
    return () => window.clearInterval(intervalId)
  }, [timer])

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setError('')
    setDigits((current) => {
      const next = [...current]
      next[index] = digit
      return next
    })
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pastedDigits) return

    event.preventDefault()
    setError('')
    setDigits(Array.from({ length: OTP_LENGTH }, (_, index) => pastedDigits[index] || ''))
    inputsRef.current[Math.min(pastedDigits.length, OTP_LENGTH) - 1]?.focus()
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    const otp = digits.join('')
    if (!validateOTP(otp)) {
      setError('Enter the 6-digit code sent to your email.')
      return
    }

    setLoading(true)
    try {
      const result = await AuthService.verifyOtp(displayEmail, otp)
      await login({
        user: {
          ...(result.user || user),
          email: displayEmail,
          method: 'otp',
          verified: true,
          is_verified: true,
        },
        access_token: result.access_token,
      })
      navigate(ROUTES.CHAT)
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setResending(true)
    setError('')
    try {
      await AuthService.resendOtp(displayEmail)
      setTimer(OTP_RESEND_TIME)
      setDigits(Array.from({ length: OTP_LENGTH }, () => ''))
      inputsRef.current[0]?.focus()
    } catch (err) {
      setError(err.message || 'Unable to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button className="auth-brand-button" type="button" onClick={() => navigate(ROUTES.LOGIN)} aria-label="Back to login" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <AiraLogo style={{ width: 72, height: 72, filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.5))' }} />
        </button>
      </div>
      
      <div className="auth-header">
        <p className="step-label">Step 2 of 2</p>
        <h2>Verify your email</h2>
      </div>
      
      <p className="otp-desc" style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>
        We have sent a 6-digit code to<br />
        <span className="otp-email" style={{ color: '#c084fc', fontWeight: 500 }}>{displayEmail}</span>
      </p>

      <form className="auth-form" onSubmit={handleVerify}>
          <div className="otp-inputs-row" aria-label="Six digit verification code">
            {digits.map((digit, index) => (
              <input
                key={`otp-${index + 1}`}
                className={`otp-box ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
                ref={(element) => { inputsRef.current[index] = element }}
                value={digit}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                inputMode="numeric"
                maxLength={1}
                pattern="[0-9]*"
                aria-label={`Digit ${index + 1}`}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          {error && <div className="otp-error-msg">{error}</div>}

          <button 
            className="otp-verify-btn" 
            type="submit" 
            disabled={digits.some((digit) => !digit) || loading}
          >
            {loading ? 'VERIFYING...' : 'VERIFY AND CREATE ACCOUNT'}
          </button>

          <div className="auth-links" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p className="resend-text" style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {resending ? 'Sending...' : timer > 0 ? `Resend code in ${timer}s` : (
                <button type="button" onClick={resend} style={{ background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer', fontWeight: 600 }}>Resend code</button>
              )}
            </p>
            <p style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '1rem' }}>Did not receive the code? Check spam or click resend.</p>
            <button type="button" onClick={() => navigate(ROUTES.LOGIN)}>
              Already have an account? Log in
            </button>
          </div>
        </form>
      <style>{`

        .otp-inputs-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 2rem;
        }

        .otp-box {
          width: 45px;
          height: 55px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 1.5rem;
          text-align: center;
          transition: all 0.2s;
        }

        .otp-box:focus, .otp-box.filled {
          outline: none;
          border-color: #c084fc;
          box-shadow: 0 0 15px rgba(192, 132, 252, 0.4);
        }

        .otp-box.error {
          border-color: #ef4444;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }

        .otp-error-msg {
          color: #fca5a5;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .otp-verify-btn {
          width: 100%;
          padding: 1rem;
          background: rgba(13, 148, 136, 0.1);
          border: 1px solid rgba(20, 184, 166, 0.2);
          color: #2dd4bf;
          border-radius: 8px;
          font-weight: 700;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 2rem;
        }

        .otp-verify-btn:hover:not(:disabled) {
          background: rgba(13, 148, 136, 0.2);
          border-color: rgba(20, 184, 166, 0.5);
          box-shadow: 0 0 20px rgba(20, 184, 166, 0.2);
          color: #5eead4;
        }
        
        .otp-verify-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

      `}</style>
    </div>
  )
}

export default OTPForm
