import { useCallback, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import SettingsLogo from './SettingsLogo'

function ProfileSettings({ user, onSave }) {
  const { login } = useAuthContext()
  const [name, setName] = useState(user?.name || user?.full_name || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [pwError, setPwError] = useState('')

  const handleSaveProfile = useCallback(async () => {
    setError('')
    setIsLoading(true)
    try {
      const result = await api.request('/api/v1/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() }),
      })
      // Refresh user in context so the navbar updates
      if (result?.user) await login(result)
      onSave?.()
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }, [name, login, onSave])

  const handleChangePassword = useCallback(async () => {
    setPwError('')
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters')
      return
    }
    setIsLoading(true)
    try {
      await api.request('/api/v1/user/change-password', {
        method: 'POST',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onSave?.()
    } catch (err) {
      setPwError(err.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }, [oldPassword, newPassword, confirmPassword, onSave])

  return (
    <section className="settings-form">
      <div className="settings-panel-heading">
        <SettingsLogo type="profile" size="lg" />
        <h1>Profile</h1>
      </div>

      {/* ── Display name ─────────────────────────── */}
      <fieldset className="settings-fieldset">
        <legend>Display Name</legend>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
          />
        </label>
        <label>
          Email
          <input
            value={user?.email || ''}
            type="email"
            readOnly
            className="input-readonly"
            aria-label="Email address (read-only)"
          />
        </label>
        {error && <p className="settings-error">{error}</p>}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSaveProfile}
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? 'Saving…' : 'Save Profile'}
        </button>
      </fieldset>

      {/* ── Change password ──────────────────────── */}
      <fieldset className="settings-fieldset">
        <legend>Change Password</legend>
        <label>
          Current Password
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label>
          New Password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
          />
        </label>
        <label>
          Confirm New Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        {pwError && <p className="settings-error">{pwError}</p>}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleChangePassword}
          disabled={isLoading || !oldPassword || !newPassword}
        >
          {isLoading ? 'Changing…' : 'Change Password'}
        </button>
      </fieldset>
    </section>
  )
}

export default ProfileSettings
