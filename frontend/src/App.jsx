import AiraLogo from './components/AiraLogo'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="brand-panel" aria-labelledby="aira-title">
        <div className="logo-frame">
          <AiraLogo className="aira-logo" />
        </div>
        <div className="brand-copy">
          <p className="eyebrow">Silence to voice intelligence</p>
          <h1 id="aira-title">AIRA</h1>
          <p>
            An adaptive voice interface with calm listening on one side and
            active response on the other.
          </p>
        </div>
      </section>
    </main>
  )
}

export default App
