import SettingsLogo from './SettingsLogo'

function VoiceSettings({ onSave }) {
  return (
    <section className="settings-form">
      <div className="settings-panel-heading">
        <SettingsLogo type="voice" size="lg" />
        <h1>Voice</h1>
      </div>
      <label>
        Voice
        <select defaultValue="default">
          <option value="default">Default</option>
          <option value="calm">Calm</option>
          <option value="bright">Bright</option>
        </select>
      </label>
      <label>
        Speech rate
        <input type="range" min="0.5" max="1.5" step="0.1" defaultValue="1" />
      </label>
      <button type="button" className="btn btn-primary" onClick={onSave}>
        Save Voice
      </button>
    </section>
  )
}

export default VoiceSettings
