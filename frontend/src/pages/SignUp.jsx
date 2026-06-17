import SignUpForm from '../components/Auth/SignUpForm'
import Iridescence from '../components/Backgrounds/Iridescence'
import Card from '../components/Common/Card'

function SignUp({ navigate }) {
  return (
    <main className="page auth-page">
      <Iridescence
        color={[0.023529411764705882, 0.7137254901960784, 0.8313725490196079]}
        mouseReact
        amplitude={0.1}
        speed={1}
      />
      <section className="auth-layout slide-up" aria-labelledby="signup-title">
        <Card className="auth-card">
          <h1 className="sr-only" id="signup-title">Sign Up</h1>
          <SignUpForm navigate={navigate} />
        </Card>
      </section>
    </main>
  )
}

export default SignUp
