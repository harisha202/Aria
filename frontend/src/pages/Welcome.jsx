import { useState } from 'react'
import AiraLogo from '../components/AiraLogo'
import SoftAurora from '../components/Backgrounds/SoftAurora'
import Button from '../components/Common/Button'
import { APP_TAGLINE, ROUTES } from '../utils/constants'

const features = [
  {
    mark: 'M',
    title: 'Voice-first interface',
    description: 'Speak naturally and ARIA understands. No typing required when voice feels easier.',
  },
  {
    mark: 'Z',
    title: 'Intelligent responses',
    description: 'Get thoughtful, context-aware answers for writing, learning, planning, and research.',
  },
  {
    mark: 'S',
    title: 'Privacy first',
    description: 'A focused workspace for conversations, designed around control and clarity.',
  },
  {
    mark: 'C',
    title: 'Conversation memory',
    description: 'Return to saved chats and continue from where your ideas left off.',
  },
  {
    mark: 'H',
    title: 'Natural voice flow',
    description: 'Move between listening, speaking, and typing without breaking your rhythm.',
  },
  {
    mark: 'T',
    title: 'Analytics dashboard',
    description: 'Track recent conversations, message activity, and quick actions in one place.',
  },
]

const howItWorks = [
  { number: '1', title: 'Speak', description: 'Press the microphone button and start talking naturally.' },
  { number: '2', title: 'ARIA listens', description: 'Your voice or text is captured and shaped into a clear prompt.' },
  { number: '3', title: 'AI responds', description: 'ARIA gives a focused answer while keeping the conversation context.' },
  { number: '4', title: 'Continue', description: 'Save the thread, revisit it later, or jump into the dashboard.' },
]

const useCases = [
  {
    mark: 'W',
    title: 'Content creation',
    description: 'Brainstorm ideas, write outlines, and refine drafts through conversation.',
  },
  {
    mark: 'L',
    title: 'Learning',
    description: 'Ask questions and unpack difficult topics in a natural back-and-forth.',
  },
  {
    mark: 'P',
    title: 'Productivity',
    description: 'Organize thoughts, plan projects, and solve problems hands-free.',
  },
  {
    mark: 'A',
    title: 'Accessibility',
    description: 'Use a voice-enabled interface when typing is not the easiest option.',
  },
  {
    mark: 'R',
    title: 'Research',
    description: 'Explore ideas, compare angles, and turn messy notes into next steps.',
  },
  {
    mark: 'Q',
    title: 'Quick chat',
    description: 'Ask simple questions or have a casual conversation whenever you need one.',
  },
]

const faqs = [
  {
    question: 'Is my data secure?',
    answer: 'ARIA is designed as a controlled workspace for your conversations. You can keep chats organized and decide when to continue, delete, or move on.',
  },
  {
    question: 'Do I need a microphone?',
    answer: 'No. Voice is central to the experience, but you can type messages whenever that is more comfortable.',
  },
  {
    question: 'Can I try ARIA without an account?',
    answer: 'Yes. Guest access lets you explore the app before creating an account.',
  },
  {
    question: 'Can ARIA remember previous conversations?',
    answer: 'Yes. Saved conversations help you return to earlier context and continue your work.',
  },
  {
    question: 'Where do I see my activity?',
    answer: 'The dashboard shows recent conversations, usage statistics, and quick actions.',
  },
  {
    question: 'Can I use ARIA offline?',
    answer: 'ARIA currently works as an online experience. Offline support can be added later if the project needs it.',
  },
]

function Welcome({ navigate, onGuest }) {
  const [expandedFaq, setExpandedFaq] = useState(null)

  const handleGuest = () => {
    onGuest?.()
    navigate(ROUTES.GUEST)
  }

  return (
    <main className="page welcome-page welcome-landing">
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

      <section className="welcome-hero fade-in" aria-labelledby="welcome-title">
        <div className="welcome-hero-heading">
          <span className="welcome-hero-logo" aria-label="ARIA logo">
            <AiraLogo className="aira-logo" />
          </span>
          <span className="welcome-title-group">
            <h1 id="welcome-title">ARIA</h1>
            <h2>{APP_TAGLINE}</h2>
          </span>
        </div>
        <div className="welcome-actions">
          <Button
            text="Get Started"
            className="welcome-action-login"
            onClick={() => navigate(ROUTES.LOGIN)}
          />
          <Button
            text="Create Account"
            variant="secondary"
            className="welcome-action-signup"
            onClick={() => navigate(ROUTES.SIGNUP)}
          />
          <Button
            text="Try as Guest Account"
            variant="secondary"
            className="welcome-action-guest"
            onClick={handleGuest}
          />
        </div>
        <p className="description welcome-info">
          An adaptive voice interface designed for calm listening, confident response, and seamless
          movement from thought to action.
        </p>
      </section>

      <section className="welcome-section" id="features" aria-labelledby="welcome-features-title">
        <p className="eyebrow">Features</p>
        <h2 id="welcome-features-title">What makes ARIA special</h2>
        <p>Thoughtfully designed tools that make voice interaction natural, intuitive, and useful.</p>
        <div className="welcome-feature-grid">
          {features.map((feature) => (
            <article className="welcome-feature-card" key={feature.title}>
              <span className="welcome-feature-mark" aria-hidden="true">{feature.mark}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="welcome-section" aria-labelledby="welcome-steps-title">
        <p className="eyebrow">How it works</p>
        <h2 id="welcome-steps-title">How ARIA works</h2>
        <div className="welcome-steps">
          {howItWorks.map((step) => (
            <article className="welcome-step" key={step.title}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="welcome-section" aria-labelledby="welcome-use-title">
        <p className="eyebrow">Use cases</p>
        <h2 id="welcome-use-title">ARIA adapts to how you work</h2>
        <p>Whether you are creating, learning, researching, or just chatting, ARIA keeps the flow simple.</p>
        <div className="welcome-use-grid">
          {useCases.map((useCase) => (
            <article className="welcome-use-card" key={useCase.title}>
              <span aria-hidden="true">{useCase.mark}</span>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="welcome-section" aria-labelledby="welcome-faq-title">
        <p className="eyebrow">FAQ</p>
        <h2 id="welcome-faq-title">Frequently asked questions</h2>
        <div className="welcome-faq-accordion">
          {faqs.map((faq, index) => (
            <article className="welcome-faq-item" key={faq.question}>
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                aria-expanded={expandedFaq === index}
              >
                <span>{faq.question}</span>
                <span className="welcome-faq-arrow" aria-hidden="true">&gt;</span>
              </button>
              {expandedFaq === index && <p>{faq.answer}</p>}
            </article>
          ))}
        </div>
      </section>

      <footer className="welcome-footer">
        <small>2026 ARIA. All rights reserved.</small>
      </footer>
    </main>
  )
}

export default Welcome
