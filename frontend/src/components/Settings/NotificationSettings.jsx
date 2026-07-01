import { useEffect, useState } from 'react'
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ browser, email }))
  }, [browser, email])

  return (
    <section className="settings-form">
      <div className="settings-panel-heading">
        <SettingsLogo type="notifications" size="lg" />
        <h1>Notifications</h1>
      </div>
      <label>
        <span>Browser notifications</span>
        <input 
          type="checkbox" 
          checked={browser} 
          onChange={(e) => setBrowser(e.target.checked)} 
        />
      </label>
      <label>
        <span>Email updates</span>
        <input 
          type="checkbox" 
          checked={email} 
          onChange={(e) => setEmail(e.target.checked)} 
        />
      </label>
    </section>
  )
}

export default NotificationSettings
