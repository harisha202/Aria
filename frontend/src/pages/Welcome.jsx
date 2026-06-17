import AiraLogo from '../components/AiraLogo'
import SoftAurora from '../components/Backgrounds/SoftAurora'
import Button from '../components/Common/Button'
import { APP_NAME, APP_TAGLINE, ROUTES } from '../utils/constants'

function Welcome({ navigate, onGuest }) {
  return (
    <main className="page welcome-page">
      <SoftAurora
        speed={2.8}
        scale={1.8}
        brightness={1.7}
        color1="#06B6D4"
        color2="#3B82F6"
        noiseFrequency={4.5}
        noiseAmplitude={2.5}
        bandHeight={0.55}
        bandSpread={1}
        octaveDecay={0.22}
        layerOffset={0}
        colorSpeed={1}
        enableMouseInteraction
        mouseInfluence={0.25}
      />
      <section className="welcome-content fade-in" aria-labelledby="welcome-title">
        <div className="welcome-logo">
          <AiraLogo className="aira-logo" />
        </div>
        <p className="eyebrow">Silence to voice intelligence</p>
        <h1 id="welcome-title">{APP_NAME}</h1>
        <p className="tagline">{APP_TAGLINE}</p>
        <p className="description">
          Meet an adaptive voice interface designed for calm listening,
          confident response, and seamless movement from thought to action.
        </p>
        <div className="welcome-actions">
          <Button text="Get Started" onClick={() => navigate(ROUTES.LOGIN)} />
          <Button text="Sign Up" variant="secondary" onClick={() => navigate(ROUTES.SIGNUP)} />
          <Button
            text="Continue as Guest"
            variant="secondary"
            onClick={() => {
              onGuest?.()
              navigate(ROUTES.CHAT)
            }}
          />
        </div>
      </section>
    </main>
  )
}

export default Welcome
