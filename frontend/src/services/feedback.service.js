import api from './api'

export const FeedbackService = {
  async submitFeedback(data) {
    return api.post('/api/v1/feedback/submit', {
      rating: data.rating,
      feedback_type: data.feedbackType || data.feedback_type || 'general',
      message: data.message || 'No message provided.',
      user_email: data.userEmail || data.user_email,
      user_name: data.userName || data.user_name || 'User',
    })
  },
}

export default FeedbackService
