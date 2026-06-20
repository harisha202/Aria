import SettingsLogo from './SettingsLogo'

function PrivacySettings({ onSave }) {
  return (
    <section className="settings-form">
      <div className="settings-panel-heading">
        <SettingsLogo type="privacy" size="lg" />
        <h1>Privacy</h1>
      </div>
      <label>
        <span>Privacy mode</span>
        <input type="checkbox" />
      </label>
      <label>
        <span>Auto-save drafts</span>
        <input type="checkbox" defaultChecked />
      </label>
      <button type="button" className="btn btn-primary" onClick={onSave}>
        Save Privacy
      </button>
    </section>
  )
}

export default PrivacySettings
