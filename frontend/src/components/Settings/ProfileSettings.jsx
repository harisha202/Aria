import SettingsLogo from './SettingsLogo'

function ProfileSettings({ user, onSave }) {
  return (
    <section className="settings-form">
      <div className="settings-panel-heading">
        <SettingsLogo type="profile" size="lg" />
        <h1>Profile</h1>
      </div>
      <label>
        Name
        <input defaultValue={user?.name || user?.full_name || ''} />
      </label>
      <label>
        Email
        <input defaultValue={user?.email || ''} type="email" />
      </label>
      <button type="button" className="btn btn-primary" onClick={onSave}>
        Save Profile
      </button>
    </section>
  )
}

export default ProfileSettings
