import SettingsLogo from './SettingsLogo'

function NotificationSettings({ onSave }) {
  return (
    <section className="settings-form">
      <div className="settings-panel-heading">
        <SettingsLogo type="notifications" size="lg" />
        <h1>Notifications</h1>
      </div>
      <label>
        <span>Browser notifications</span>
        <input type="checkbox" defaultChecked />
      </label>
      <label>
        <span>Email updates</span>
        <input type="checkbox" />
      </label>
      <button type="button" className="btn btn-primary" onClick={onSave}>
        Save Notifications
      </button>
    </section>
  )
}

export default NotificationSettings
