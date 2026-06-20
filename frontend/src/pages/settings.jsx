import { useState } from 'react'
import AiraLogo from '../components/AiraLogo'
import PixelSnow from '../components/Backgrounds/PixelSnow'
import Navbar from '../components/Common/Navbar'
import Toast from '../components/Common/Toast'
import ProfileSettings from '../components/Settings/ProfileSettings'
import VoiceSettings from '../components/Settings/VoiceSettings'
import PrivacySettings from '../components/Settings/PrivacySettings'
import NotificationSettings from '../components/Settings/NotificationSettings'
import SettingsLogo from '../components/Settings/SettingsLogo'
import { useAuthContext } from '../context/AuthContext'
import { ROUTES } from '../utils/constants'

const tabs = [
  { id: 'profile', label: 'Profile', logo: 'profile' },
  { id: 'voice', label: 'Voice', logo: 'voice' },
  { id: 'privacy', label: 'Privacy', logo: 'privacy' },
  { id: 'notifications', label: 'Notifications', logo: 'notifications' },
]

function SettingsPage({ navigate }) {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState(() => {
    const requestedTab = window.history.state?.tab
    return tabs.some((tab) => tab.id === requestedTab) ? requestedTab : 'profile'
  })
  const [toast, setToast] = useState(null)

  const handleSave = () => {
    setToast({ message: 'Settings saved', type: 'success' })
  }

  const renderPanel = () => {
    if (activeTab === 'voice') return <VoiceSettings onSave={handleSave} />
    if (activeTab === 'privacy') return <PrivacySettings onSave={handleSave} />
    if (activeTab === 'notifications') return <NotificationSettings onSave={handleSave} />
    return <ProfileSettings user={user} onSave={handleSave} />
  }

  return (
    <main className="app-shell snow-page">
      <div className="page-pixel-snow-bg">
        <PixelSnow
          color="#06B6D4"
          flakeSize={0.022}
          minFlakeSize={1.25}
          pixelResolution={230}
          speed={2.1}
          density={0.45}
          direction={175}
          brightness={1.4}
          depthFade={8}
          farPlane={25}
          gamma={0.4545}
          variant="square"
        />
      </div>
      <Navbar
        navigate={navigate}
        user={user}
        onLogout={() => navigate(ROUTES.LOGOUT)}
      />

      <div className="app-content settings-layout">
        <aside className="settings-menu" aria-label="Settings sections">
          <div className="settings-logo">
            <AiraLogo className="page-logo-canvas" width={400} height={380} />
          </div>
          {tabs.map((tab) => (
            <button
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              type="button"
              key={tab.id}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              <SettingsLogo type={tab.logo} size="sm" />
              {tab.label}
            </button>
          ))}
          <button type="button" className="settings-tab" onClick={() => navigate(ROUTES.DASHBOARD)}>
            <SettingsLogo type="dashboard" size="sm" />
            Back to Dashboard
          </button>
        </aside>

        <section className="settings-panel">{renderPanel()}</section>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}

export default SettingsPage
