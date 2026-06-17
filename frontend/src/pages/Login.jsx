import LoginForm from '../components/Auth/LoginForm'
import Lightfall from '../components/Backgrounds/Lightfall'
import Card from '../components/Common/Card'

function Login({ navigate }) {
  return (
    <main className="page auth-page">
      <Lightfall
        colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
        backgroundColor="#0A29FF"
        speed={1.5}
        streakCount={9}
        streakWidth={1}
        streakLength={1}
        glow={1}
        density={1.1}
        twinkle={1}
        zoom={3}
        backgroundGlow={1.1}
        opacity={1}
        mouseInteraction
        mouseStrength={0.5}
        mouseRadius={1}
      />
      <section className="auth-layout slide-up" aria-labelledby="login-title">
        <Card className="auth-card">
          <h1 className="sr-only" id="login-title">Login</h1>
          <LoginForm navigate={navigate} />
        </Card>
      </section>
    </main>
  )
}

export default Login
