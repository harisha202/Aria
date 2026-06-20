import OTPForm from '../components/Auth/OTPForm'
import Card from '../components/Common/Card'
import Lightfall from '../components/Backgrounds/Lightfall'

function OTPVerification({ navigate }) {
  return (
    <main className="page auth-page">
      <Lightfall
        colors={['#A6C8FF', '#31D0AA', '#FF9FFC']}
        backgroundColor="#081A3A"
        speed={1.2}
        streakCount={8}
        glow={1}
        density={1}
        opacity={1}
      />
      <section className="auth-layout slide-up" aria-labelledby="otp-title">
        <Card className="auth-card">
          <h1 className="sr-only" id="otp-title">Verify OTP</h1>
          <OTPForm navigate={navigate} />
        </Card>
      </section>
    </main>
  )
}

export default OTPVerification
