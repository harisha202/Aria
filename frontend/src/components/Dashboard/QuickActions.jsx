import SettingsLogo from '../Settings/SettingsLogo'

function QuickActions({ onNewChat, onChat, onSettings }) {
  return (
    <div className="quick-actions">
      <button type="button" className="btn btn-primary" onClick={onNewChat}>
        New Chat
      </button>
      <button type="button" className="btn btn-secondary" onClick={onChat}>
        <SettingsLogo type="chat" size="sm" />
        Open Chat
      </button>
      <button type="button" className="btn btn-secondary" onClick={onSettings}>
        <SettingsLogo type="settings" size="sm" />
        Settings
      </button>
    </div>
  )
}

export default QuickActions
