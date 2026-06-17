import OTPForm from '../components/Auth/OTPForm'
import ElectricBorder from '../components/Backgrounds/ElectricBorder'
import Card from '../components/Common/Card'

function OTPVerification({ navigate }) {
  return (
    <main className="page auth-page otp-page">
      <section className="auth-layout slide-up" aria-labelledby="otp-title">
        <ElectricBorder className="otp-border">
          <Card className="auth-card">
            <h1 className="sr-only" id="otp-title">Verify Email</h1>
            <OTPForm navigate={navigate} />
          </Card>
        </ElectricBorder>
      </section>
    </main>
  )
}

export default OTPVerification
