import { useState } from 'react'
import './FeedbackForm.css'

const feedbackTypes = [
  { value: 'bug', label: 'Bug Report', description: 'Something is not working' },
  { value: 'feature', label: 'Feature Request', description: 'Suggest a new feature' },
  { value: 'improvement', label: 'Improvement', description: 'Suggest a better workflow' },
  { value: 'general', label: 'General Feedback', description: 'Share any other feedback' },
]

function FeedbackForm({ isOpen, onClose, onSubmit, userName, userEmail }) {
  const [rating, setRating] = useState(5)
  const [feedbackType, setFeedbackType] = useState('general')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const reset = () => {
    setRating(5)
    setFeedbackType('general')
    setMessage('')
    setError('')
    setSuccess(false)
    setIsSubmitting(false)
  }

  const handleClose = (reason = 'skipped') => {
    reset()
    onClose(reason)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit({
        rating,
        feedbackType,
        message: message.trim(),
        userEmail,
        userName,
      })
      setSuccess(true)
      window.setTimeout(() => handleClose('submitted'), 1600)
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again.')
      setIsSubmitting(false)
    }
  }

  const updateMessage = (event) => {
    setMessage(event.target.value.slice(0, 500))
  }

  if (!isOpen) return null

  return (
    <div className="feedback-overlay" role="presentation">
      <section className="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
        <div className="feedback-header">
          <div>
            <p className="step-label">Before you go</p>
            <h2 id="feedback-title">Help Us Improve ARIA</h2>
          </div>
          <button className="feedback-close" type="button" onClick={() => handleClose('closed')} aria-label="Close feedback form">
            x
          </button>
        </div>

        {success ? (
          <div className="feedback-success">
            <div className="success-mark" aria-hidden="true">✓</div>
            <p>Thank you for your feedback.</p>
            <span>We sent a confirmation to {userEmail}.</span>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <p className="feedback-intro">
              Your feedback helps make ARIA sharper, calmer, and more useful.
            </p>

            <div className="feedback-group">
              <label htmlFor="rating">How satisfied are you with ARIA?</label>
              <div className="rating-container" id="rating">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`rating-star ${rating >= num ? 'active' : ''}`}
                    onClick={() => setRating(num)}
                    aria-label={`Rate ${num} out of 5`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="rating-labels">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="feedback-group">
              <label>What type of feedback?</label>
              <div className="feedback-type-grid">
                {feedbackTypes.map((type) => (
                  <label key={type.value} className="feedback-type-label">
                    <input
                      type="radio"
                      name="feedbackType"
                      value={type.value}
                      checked={feedbackType === type.value}
                      onChange={(event) => setFeedbackType(event.target.value)}
                    />
                    <span className="feedback-type-content">
                      <span className="feedback-type-main">{type.label}</span>
                      <span className="feedback-type-desc">{type.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="feedback-group">
              <label htmlFor="message">
                Your feedback <span className="optional">(optional)</span>
              </label>
              <textarea
                id="message"
                className="feedback-textarea"
                placeholder="Tell us more about your experience..."
                value={message}
                onChange={updateMessage}
                rows={4}
              />
              <p className="char-count">{message.length}/500</p>
            </div>

            {error && (
              <div className="feedback-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="feedback-actions">
              <button type="button" className="feedback-secondary" onClick={() => handleClose('skipped')} disabled={isSubmitting}>
                Skip
              </button>
              <button type="submit" className="feedback-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>

            <p className="feedback-note">A confirmation will be sent to {userEmail}.</p>
          </form>
        )}
      </section>
    </div>
  )
}

export default FeedbackForm
