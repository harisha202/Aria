import { useEffect, useRef, useState } from 'react'
import Button from '../Common/Button'
import { useAuthContext } from '../../context/AuthContext'
import { OTP_LENGTH, OTP_RESEND_TIME, ROUTES } from '../../utils/constants'
import { validateOTP } from '../../utils/validators'

function OTPForm({ email = 'email@example.com', navigate }) {
  const { user, login } = useAuthContext()
  const displayEmail = user?.email || email
  const [digits, setDigits] = useState(Array.from({ length: OTP_LENGTH }, () => ''))
  const [timer, setTimer] = useState(OTP_RESEND_TIME)
  const [error, setError] = useState('')
  const inputsRef = useRef([])

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

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleVerify = (event) => {
    event.preventDefault()
    const otp = digits.join('')
    if (!validateOTP(otp)) {
      setError('Enter the 6-digit code sent to your email.')
      return
    }
    login({ ...user, email: displayEmail, method: 'otp', verified: true })
    navigate(ROUTES.CHAT)
  }

  const resend = () => {
    setTimer(OTP_RESEND_TIME)
    setDigits(Array.from({ length: OTP_LENGTH }, () => ''))
    inputsRef.current[0]?.focus()
  }

  return (
    <form className="auth-form" onSubmit={handleVerify}>
      <div className="auth-header">
        <p className="step-label">Step 2 of 2</p>
        <h2>Verify Email</h2>
        <p>OTP sent to {displayEmail}</p>
      </div>
      <div className="otp-inputs" aria-label="Six digit verification code">
        {digits.map((digit, index) => (
          <input
            key={`otp-${index + 1}`}
            ref={(element) => {
              inputsRef.current[index] = element
            }}
            value={digit}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${index + 1}`}
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
          />
        ))}
      </div>
      {error && <span className="error-message otp-error">{error}</span>}
      <Button text="Verify" type="submit" />
      <button className="resend-btn" type="button" onClick={resend} disabled={timer > 0}>
        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
      </button>
    </form>
  )
}

export default OTPForm
