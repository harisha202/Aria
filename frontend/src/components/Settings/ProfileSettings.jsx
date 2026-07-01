import { useCallback, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import SettingsLogo from './SettingsLogo'

function ProfileSettings({ user, onSave }) {
  const { login } = useAuthContext()
  const [name, setName] = useState(user?.name || user?.full_name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
            id="displayName"
            name="displayName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
          />
        </label>
        <label>
          Email
          <input
            id="emailAddress"
            name="emailAddress"
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

    </section>
  )
}

export default ProfileSettings
