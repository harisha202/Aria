import { useEffect, useState, useRef } from 'react'
import SettingsLogo from './SettingsLogo'

const STORAGE_KEY = 'aria-notification-settings'

const loadSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function NotificationSettings({ onSave }) {
  const saved = loadSettings()
  const [browser, setBrowser] = useState(saved.browser ?? true)
  const [email, setEmail] = useState(saved.email ?? false)

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ browser, email }))
    onSave?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browser, email])

  return (
    <section className="settings-form">
      <div className="settings-panel-heading">
        <SettingsLogo type="notifications" size="lg" />
        <h1>Notifications</h1>
      </div>
      <fieldset className="settings-fieldset">
        <legend>Notification Preferences</legend>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            id="browserNotifications"
            name="browserNotifications"
            checked={browser} 
            onChange={(e) => setBrowser(e.target.checked)} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '15px', color: 'var(--text)' }}>Browser notifications</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            id="emailUpdates"
            name="emailUpdates"
            checked={email} 
            onChange={(e) => setEmail(e.target.checked)} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '15px', color: 'var(--text)' }}>Email updates</span>
        </label>
      </fieldset>
    </section>
  )
}

export default NotificationSettings
