import { useEffect, useState } from 'react'
import SettingsLogo from './SettingsLogo'

const STORAGE_KEY = 'aria-privacy-settings'

const loadSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function PrivacySettings({ onSave }) {
  const saved = loadSettings()
  const [privacyMode, setPrivacyMode] = useState(saved.privacyMode ?? false)
  const [autoSave, setAutoSave] = useState(saved.autoSave ?? true)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ privacyMode, autoSave }))
  }, [privacyMode, autoSave])

  return (
    <section className="settings-form">
      <div className="settings-panel-heading">
        <SettingsLogo type="privacy" size="lg" />
        <h1>Privacy</h1>
      </div>
      <fieldset className="settings-fieldset">
        <legend>Privacy Preferences</legend>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            id="privacyMode"
            name="privacyMode"
            checked={privacyMode} 
            onChange={(e) => setPrivacyMode(e.target.checked)} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '15px', color: 'var(--text)' }}>Strict Privacy Mode</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            id="autoSave"
            name="autoSave"
            checked={autoSave} 
            onChange={(e) => setAutoSave(e.target.checked)} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '15px', color: 'var(--text)' }}>Auto-save drafts to local storage</span>
        </label>
      </fieldset>
    </section>
  )
}

export default PrivacySettings
