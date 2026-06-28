import { useMemo, useState } from 'react'
import AiraLogo from '../AiraLogo'
import Button from '../Common/Button'
import Input from '../Common/Input'
import { useAuthContext } from '../../context/AuthContext'
import { ROUTES } from '../../utils/constants'
import { validateEmail, validateName, validatePassword, validateStrongPassword } from '../../utils/validators'

function SignUpForm({ navigate }) {
  const { signup } = useAuthContext()
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => {
    if (!values.password) return 'empty'
    if (validateStrongPassword(values.password)) return 'strong'
    if (validatePassword(values.password)) return 'medium'
    return 'weak'
  }, [values.password])

  const updateField = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!validateName(values.name)) nextErrors.name = 'Enter your full name.'
    if (!validateEmail(values.email)) nextErrors.email = 'Enter a valid email address.'
    if (!validatePassword(values.password)) nextErrors.password = 'Password must be at least 6 characters.'
    if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      setLoading(true)
      try {
        await signup({ name: values.name, email: values.email, password: values.password })
        navigate(ROUTES.OTP)
      } catch (err) {
        setErrors({ form: err.message || 'Unable to create account.' })
      } finally {
        setLoading(false)
      }
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
        <p className="step-label">Step 1 of 2</p>
        <h2>Create your account</h2>
      </div>
      <Input label="Full Name" name="name" value={values.name} onChange={updateField} error={errors.name} placeholder="Your name" autoComplete="name" required />
      <Input label="Email" type="email" name="email" value={values.email} onChange={updateField} error={errors.email} placeholder="you@example.com" autoComplete="email" required />
      <Input label="Password" type="password" name="password" value={values.password} onChange={updateField} error={errors.password} placeholder="Create password" autoComplete="new-password" required />
      <div className={`password-strength strength-${strength}`}>
        <span />
        <small>{strength === 'empty' ? 'Password strength' : `${strength} password`}</small>
      </div>
      <Input label="Confirm Password" type="password" name="confirmPassword" value={values.confirmPassword} onChange={updateField} error={errors.confirmPassword} placeholder="Confirm password" autoComplete="new-password" required />
      <Button text="Sign Up" type="submit" loading={loading} />
      {errors.form && <p className="form-error">{errors.form}</p>}
      <div className="auth-links">
        <button type="button" onClick={() => navigate(ROUTES.LOGIN)}>
          Already have an account?
        </button>
      </div>
    </form>
  )
}

export default SignUpForm
