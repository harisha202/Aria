import AiraLogo from '../components/AiraLogo'
import SoftAurora from '../components/Backgrounds/SoftAurora'
import { APP_NAME, ROUTES } from '../utils/constants'

function WelcomePageComprehensive({ navigate }) {
  return (
    <main className="welcome-dashboard">
      <SoftAurora
        speed={1.5}
        scale={2.0}
        brightness={1.2}
        color1="#0f172a"
        color2="#1e1b4b"
        noiseFrequency={3.0}
        noiseAmplitude={1.5}
        bandHeight={0.4}
        bandSpread={1.2}
        layerOffset={0}
        colorSpeed={0.5}
      />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <AiraLogo className="dashboard-logo" />
          <h1 className="dashboard-title">{APP_NAME}</h1>
          <h3 className="dashboard-subtitle">Where Silence Finds Its Voice</h3>
          <h4 className="dashboard-instruction">Select your path to access the intelligent assistant</h4>
        </div>

        <div className="role-cards-container">
          {/* Sign In Card */}
          <button 
            type="button"
            className="role-card role-signin"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            <div className="role-icon">S</div>
            <h3>Sign In</h3>
            <p>Access your existing account</p>
            <div className="role-arrow">&gt;</div>
          </button>

          {/* Create Account Card */}
          <button 
            type="button"
            className="role-card role-signup"
            onClick={() => navigate(ROUTES.SIGNUP)}
          >
            <div className="role-icon">C</div>
            <h3>Create Account</h3>
            <p>Register a new ARIA profile</p>
            <div className="role-arrow">&gt;</div>
          </button>

          {/* Guest Card */}
          <button 
            type="button"
            className="role-card role-guest"
            onClick={() => navigate(ROUTES.GUEST)}
          >
            <div className="role-icon">G</div>
            <h3>Try as Guest</h3>
            <p>Explore without an account</p>
            <div className="role-arrow">&gt;</div>
          </button>
        </div>

        {/* Info Section */}
        <div className="dashboard-info">
          <h2>Experience the Future of AI</h2>
          <p>
            ARIA is your advanced voice-first AI companion. Designed for seamless natural language interactions, 
            uncompromising privacy, and lightning-fast real-time responses. Choose your path 
            above to begin a smarter conversation today.
          </p>
        </div>
      </div>
    </main>
  )
}

export default WelcomePageComprehensive