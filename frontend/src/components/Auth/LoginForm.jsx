import { useState } from 'react'
import AiraLogo from '../AiraLogo'
import Button from '../Common/Button'
import Input from '../Common/Input'
import { useAuthContext } from '../../context/AuthContext'
import { ROUTES } from '../../utils/constants'
import { validateEmail, validatePassword } from '../../utils/validators'

function LoginForm({ navigate }) {
  const { login } = useAuthContext()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!validateEmail(values.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!validatePassword(values.password)) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await login(values.email, values.password)
      navigate(ROUTES.CHAT)
    } catch (err) {
      setErrors({ form: err.message || 'Unable to login.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form-logo">
        <button className="auth-brand-button" type="button" onClick={() => navigate(ROUTES.WELCOME)} aria-label="Back to welcome">
          <AiraLogo className="auth-logo-canvas" width={400} height={380} />
        </button>
      </div>
      <div className="auth-header">
        <p className="step-label">Welcome back</p>
        <h2>Login to ARIA</h2>
      </div>
      <Input
        label="Email"
        type="email"
        name="email"
        value={values.email}
        onChange={updateField}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        value={values.password}
        onChange={updateField}
        error={errors.password}
        placeholder="Enter password"
        autoComplete="current-password"
        required
      />
      <Button text="Login" type="submit" loading={loading} />
      {errors.form && <p className="form-error">{errors.form}</p>}
      <div className="auth-links">
        <button type="button" onClick={() => navigate(ROUTES.WELCOME)}>
          Back
        </button>
      </div>
    </form>
  )
}

export default LoginForm
