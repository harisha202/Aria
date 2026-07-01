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
      <label>
        <span>Privacy mode</span>
        <input 
          type="checkbox" 
          checked={privacyMode} 
          onChange={(e) => setPrivacyMode(e.target.checked)} 
        />
      </label>
      <label>
        <span>Auto-save drafts</span>
        <input 
          type="checkbox" 
          checked={autoSave} 
          onChange={(e) => setAutoSave(e.target.checked)} 
        />
      </label>
    </section>
  )
}

export default PrivacySettings
