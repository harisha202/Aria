import { useState } from 'react'
import AiraLogo from '../components/AiraLogo'
import SoftAurora from '../components/Backgrounds/SoftAurora'
import { APP_NAME, ROUTES } from '../utils/constants'

function WelcomePageComprehensive({ navigate, onGuest }) {
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestData, setGuestData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleGuestInputChange = (e) => {
    const { name, value } = e.target
    setGuestData({ ...guestData, [name]: value })
  }

  const handleGuestSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (!guestData.fullName.trim()) {
      setMessage({ type: 'error', text: 'Please enter your full name' })
      return
    }
    if (!guestData.email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/guest-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestData.fullName,
          email: guestData.email,
          phone: guestData.phone || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Check your email for confirmation link',
        })
        setTimeout(() => {
          setShowGuestForm(false)
          onGuest?.({ guestId: data.guestId, name: guestData.fullName })
          navigate(ROUTES.CHAT)
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: data.detail || 'Signup failed. Please try again.',
        })
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection.',
      })
    } finally {
      setLoading(false)
    }
  }

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
          <div 
            className="role-card role-signin"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            <div className="role-icon">S</div>
            <h3>Sign In</h3>
            <p>Access your existing account</p>
            <div className="role-arrow">&gt;</div>
          </div>

          {/* Create Account Card */}
          <div 
            className="role-card role-signup"
            onClick={() => navigate(ROUTES.SIGNUP)}
          >
            <div className="role-icon">C</div>
            <h3>Create Account</h3>
            <p>Register a new ARIA profile</p>
            <div className="role-arrow">&gt;</div>
          </div>

          {/* Guest Card */}
          <div 
            className="role-card role-guest"
            onClick={() => setShowGuestForm(true)}
          >
            <div className="role-icon">G</div>
            <h3>Try as Guest</h3>
            <p>Explore without an account</p>
            <div className="role-arrow">&gt;</div>
          </div>
        </div>

        {/* Info Section */}
        <div className="dashboard-info" style={{ marginTop: '4rem', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#f8fafc' }}>Experience the Future of AI</h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: '1.8' }}>
            ARIA is your advanced voice-first AI companion. Designed for seamless natural language interactions, 
            military-grade privacy, and lightning-fast real-time responses. Choose your path 
            above to begin a smarter conversation today.
          </p>
        </div>
      </div>

      {/* GUEST MODAL */}
      {showGuestForm && (
        <div className="guest-modal-overlay" onClick={() => setShowGuestForm(false)}>
          <div className="guest-modal" onClick={(e) => e.stopPropagation()}>
            <div className="guest-modal-header">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <AiraLogo style={{ width: 72, height: 72, marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.5))' }} />
              </div>
              <h2>Guest Access</h2>
              <p>Explore ARIA with read-only access. No account needed.</p>
            </div>

            <form onSubmit={handleGuestSubmit} className="guest-form">
              <div className="form-group">
                <label>FULL NAME</label>
                <input
                  type="text"
                  name="fullName"
                  value={guestData.fullName}
                  onChange={handleGuestInputChange}
                  placeholder="John Doe"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="email"
                  value={guestData.email}
                  onChange={handleGuestInputChange}
                  placeholder="john@example.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>COMPANY NAME</label>
                <input
                  type="text"
                  name="company"
                  value={guestData.company}
                  onChange={handleGuestInputChange}
                  placeholder="Acme Corporation"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>PHONE NUMBER</label>
                <input
                  type="tel"
                  name="phone"
                  value={guestData.phone}
                  onChange={handleGuestInputChange}
                  placeholder="+1 (555) 000-0000"
                  disabled={loading}
                />
              </div>

              {message.text && (
                <div className={`message message-${message.type}`}>
                  {message.text}
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Continue as Guest'}
              </button>

              <button type="button" className="btn-back" onClick={() => setShowGuestForm(false)}>
                Back to Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .welcome-dashboard {
          min-height: 100vh;
          background: #09090b;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .dashboard-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .dashboard-logo {
          width: 150px;
          height: 150px;
          margin: 0 auto 1.5rem;
          filter: drop-shadow(0 0 30px rgba(56, 182, 255, 0.6));
        }

        .dashboard-title {
          font-size: 6.5rem;
          font-weight: 800;
          letter-spacing: -3px;
          background: linear-gradient(135deg, #38b6ff 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          font-size: 2.5rem;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 0.8rem;
        }

        .dashboard-instruction {
          font-size: 1.2rem;
          font-weight: 400;
          color: #94a3b8;
        }

        .role-cards-container {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
          width: 100%;
        }

        .role-card {
          flex: 1;
          min-width: 260px;
          max-width: 300px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .role-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 16px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        /* Glowing Themes for Cards based on reference image */
        .role-signin {
          border-color: rgba(6, 182, 212, 0.3); /* Cyan */
        }
        .role-signin:hover {
          transform: translateY(-5px);
          border-color: rgba(6, 182, 212, 0.8);
          box-shadow: 0 10px 40px -10px rgba(6, 182, 212, 0.3);
        }
        .role-signin .role-icon {
          color: #06b6d4;
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
        }

        .role-signup {
          border-color: rgba(236, 72, 153, 0.3); /* Pink */
        }
        .role-signup:hover {
          transform: translateY(-5px);
          border-color: rgba(236, 72, 153, 0.8);
          box-shadow: 0 10px 40px -10px rgba(236, 72, 153, 0.3);
        }
        .role-signup .role-icon {
          color: #ec4899;
          text-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
        }

        .role-guest {
          border-color: rgba(34, 197, 94, 0.3); /* Green */
        }
        .role-guest:hover {
          transform: translateY(-5px);
          border-color: rgba(34, 197, 94, 0.8);
          box-shadow: 0 10px 40px -10px rgba(34, 197, 94, 0.3);
        }
        .role-guest .role-icon {
          color: #22c55e;
          text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
        }

        .role-icon {
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          font-family: monospace;
        }

        .role-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.5rem;
        }

        .role-card p {
          font-size: 0.9rem;
          color: #94a3b8;
          margin-bottom: 2rem;
        }

        .role-arrow {
          color: inherit;
          font-size: 1.2rem;
          font-weight: bold;
          opacity: 0.5;
          transition: all 0.3s ease;
        }
        .role-signin .role-arrow { color: #06b6d4; }
        .role-signup .role-arrow { color: #ec4899; }
        .role-guest .role-arrow { color: #22c55e; }

        .role-card:hover .role-arrow {
          opacity: 1;
          transform: translateX(5px);
        }

        /* GUEST MODAL (kept minimal and matching auth modal aesthetic) */
        .guest-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .guest-modal {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .guest-modal-header h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .guest-modal-header p {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          letter-spacing: 1px;
        }

        .form-group input {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #fff;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #38b6ff;
        }

        .btn-submit, .btn-back {
          width: 100%;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-submit {
          background: linear-gradient(135deg, #38b6ff 0%, #3b82f6 100%);
          color: #fff;
          margin-bottom: 1rem;
        }
        
        .btn-submit:hover:not(:disabled) {
          filter: brightness(1.1);
        }

        .btn-back {
          background: transparent;
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .btn-back:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }
        .message-error { background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2); }
        .message-success { background: rgba(34, 197, 94, 0.1); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.2); }
      `}</style>
    </main>
  )
}

export default WelcomePageComprehensive