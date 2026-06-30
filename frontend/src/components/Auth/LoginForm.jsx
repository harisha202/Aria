import { useState } from 'react'
import { ROUTES } from '../../utils/constants'
import AiraLogo from '../AiraLogo'

function LoginForm({ navigate }) {
  const [values, setValues] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const updateField = (e) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!values.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(values.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!values.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(values.password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        // API call to login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
            rememberMe,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          // Store token
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          // Navigate to dashboard
          navigate(ROUTES.DASHBOARD)
        } else {
          setErrors({ submit: data.detail || 'Login failed' })
        }
      } catch {
        setErrors({ submit: 'Network error. Please try again.' })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="login-form-wrapper">
      {/* Header */}
      <div className="login-header">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AiraLogo style={{ width: 50, height: 50, marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.4))' }} />
        </div>
        <h1 className="login-title">Sign In to ARIA</h1>
        <p className="login-subtitle">Welcome back. Your voice-first AI assistant awaits.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="login-form">
        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="login-email" className="form-label">
            <span className="label-icon">📧</span>
            Email Address
          </label>
          <div className="input-wrapper">
            <input
              id="login-email"
              type="email"
              name="email"
              value={values.email}
              onChange={updateField}
              placeholder="your@email.com"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              disabled={loading}
            />
            {errors.email && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.email}
              </div>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="form-group">
          <div className="label-row">
            <label htmlFor="login-password" className="form-label">
              <span className="label-icon">🔐</span>
              Password
            </label>
          </div>
          <div className="input-wrapper password-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={values.password}
              onChange={updateField}
              placeholder="••••••••"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {errors.password && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.password}
              </div>
            )}
          </div>
        </div>

        {/* Remember Me */}
        <div className="remember-me">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="remember-me">Keep me signed in</label>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="submit-error">
            <span className="error-icon">❌</span>
            {errors.submit}
          </div>
        )}

        {/* Sign In Button */}
        <button
          type="submit"
          className="btn-signin"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Signing In...
            </>
          ) : (
            <>
              <span>🎤</span>
              Sign In
            </>
          )}
        </button>

        {/* Divider */}
        <div className="form-divider">
          <span>or continue as</span>
        </div>

        {/* Guest Button */}
        <button
          type="button"
          className="btn-guest"
          onClick={() => navigate(ROUTES.GUEST_ACCESS)}
          disabled={loading}
        >
          <span>👤</span>
          Continue as Guest
        </button>
      </form>

      {/* Footer */}
      <div className="login-footer">
        <p className="footer-text">Don't have an account?</p>
        <button
          type="button"
          className="btn-create-free"
          onClick={() => navigate(ROUTES.SIGNUP)}
        >
          Create one free
        </button>
      </div>

      <style>{`
        .login-form-wrapper {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 0;
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .aria-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 50px;
          margin-bottom: 1.5rem;
          animation: fadeInDown 0.5s ease;
        }

        .badge-icon {
          font-size: 1rem;
        }

        .badge-text {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-title {
          margin: 0 0 0.5rem;
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #0EA5E9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          margin: 0;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Form Groups */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: fadeInUp 0.5s ease;
        }

        .form-group:nth-child(2) {
          animation-delay: 0.1s;
        }

        .form-group:nth-child(3) {
          animation-delay: 0.2s;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Labels */
        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.8);
        }

        .label-icon {
          font-size: 0.95rem;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-password-btn {
          background: none;
          border: none;
          font-size: 0.8rem;
          color: #06B6D4;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          padding: 0;
          margin: 0;
        }

        .forgot-password-btn:hover {
          color: #0EA5E9;
          text-decoration: underline;
        }

        /* Input Wrapper */
        .input-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .password-wrapper {
          position: relative;
        }

        /* Input */
        .form-input {
          padding: 0.75rem 1rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          font-family: inherit;
          outline: none;
        }

        .form-input::placeholder {
          color: rgba(148, 163, 184, 0.6);
        }

        .form-input:focus {
          background: rgba(51, 65, 85, 0.8);
          border-color: #06B6D4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .form-input:disabled {
          background: rgba(30, 41, 59, 0.3);
          color: rgba(255, 255, 255, 0.4);
          cursor: not-allowed;
        }

        .form-input.input-error {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .form-input.input-error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        /* Password Toggle */
        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          opacity: 0.6;
        }

        .password-toggle:hover {
          opacity: 1;
        }

        /* Error Message */
        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #ef4444;
          margin-top: 0.25rem;
        }

        .error-icon {
          font-size: 0.85rem;
        }

        /* Remember Me */
        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .remember-me input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #06B6D4;
          border-radius: 4px;
          border: 1px solid rgba(6, 182, 212, 0.3);
          background: rgba(30, 41, 59, 0.6);
          transition: all 0.2s ease;
        }

        .remember-me input:checked {
          background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);
          border-color: #06B6D4;
        }

        .remember-me label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          user-select: none;
        }

        /* Submit Error */
        .submit-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 0.85rem;
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

        /* Buttons */
        .btn-signin,
        .btn-guest {
          padding: 0.85rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          disabled: disabled;
        }

        .btn-signin {
          background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2);
        }

        .btn-signin:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3);
        }

        .btn-signin:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-signin:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .btn-guest {
          background: rgba(6, 182, 212, 0.1);
          border: 1.5px solid rgba(6, 182, 212, 0.4);
          color: #06B6D4;
        }

        .btn-guest:hover:not(:disabled) {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }

        .btn-guest:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Divider */
        .form-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0.5rem 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-divider::before,
        .form-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(6, 182, 212, 0.2);
        }

        /* Footer */
        .login-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(6, 182, 212, 0.1);
          margin-top: 0.5rem;
          animation: fadeInUp 0.5s ease;
          animation-delay: 0.3s;
        }

        .footer-text {
          margin: 0 0 1rem;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .btn-create-free {
          width: 100%;
          padding: 0.85rem;
          background: rgba(236, 72, 153, 0.1);
          border: 1.5px solid rgba(236, 72, 153, 0.4);
          color: #ec4899;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-create-free:hover {
          background: rgba(236, 72, 153, 0.2);
          border-color: rgba(236, 72, 153, 0.8);
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.3);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-form-wrapper {
            padding: 0;
          }

          .login-title {
            font-size: 1.5rem;
          }

          .login-subtitle {
            font-size: 0.85rem;
          }

          .form-group {
            gap: 0.5rem;
          }

          .btn-signin,
          .btn-guest {
            padding: 0.75rem;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 360px) {
          .login-title {
            font-size: 1.35rem;
          }

          .login-form {
            gap: 1rem;
          }

          .aria-badge {
            padding: 0.4rem 0.8rem;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  )
}

export default LoginForm