import AiraLogo from '../AiraLogo'
import SettingsLogo from '../Settings/SettingsLogo'
import { ROUTES } from '../../utils/constants'

function Navbar({ navigate, user, onLogout }) {
  return (
    <header className="app-navbar">
      <button type="button" className="app-brand" onClick={() => navigate?.(ROUTES.DASHBOARD)}>
        <span className="brand-logo">
          <AiraLogo className="brand-logo-canvas" width={400} height={380} />
        </span>
        <span>ARIA</span>
      </button>

      <div className="user-menu">
        <span className="avatar" aria-hidden="true">
          {(user?.name || user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
        </span>
        <button type="button" className="ghost-button" onClick={onLogout}>
          <SettingsLogo type="logout" size="sm" />
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar
