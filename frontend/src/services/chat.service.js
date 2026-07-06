import api from './api'

const getUserId = () => {
  const storedUser = localStorage.getItem('aria-user')
  if (storedUser) {
    try {
      return JSON.parse(storedUser)?.id || 'guest'
    } catch {
      return 'guest'
    }
  }
  return 'guest'
}

export const ChatService = {
  async getConversations(userId = getUserId()) {
    const data = await api.get(`/api/v1/chat/conversations?user_id=${encodeURIComponent(userId)}`)
    return data.conversations || []
  },

  async getWeeklyStats(userId = getUserId()) {
    const data = await api.get(`/api/v1/chat/stats/weekly?user_id=${encodeURIComponent(userId)}`)
    return data.stats || []
  },

  async getConversation(id) {
    const data = await api.get(`/api/v1/chat/conversations/${id}?user_id=${encodeURIComponent(getUserId())}`)
    return data.conversation || null
  },

  async createConversation(data = {}) {
    const response = await api.post('/api/v1/chat/conversations', {
      user_id: data.user_id || getUserId(),
      title: data.title || 'New conversation',
      model: data.model || import.meta.env.VITE_DEFAULT_AI_MODEL || 'claude',
    })
    return response.conversation
  },

  async deleteConversation(id) {
    await api.delete(`/api/v1/chat/conversations/${id}?user_id=${encodeURIComponent(getUserId())}`)
    return true
  },

  async getMessages(conversationId) {
    const data = await api.get(`/api/v1/chat/conversations/${conversationId}/messages?user_id=${encodeURIComponent(getUserId())}`)
    return data.messages || []
  },

  async sendMessage(conversationId, message, options = {}) {
    return api.post('/api/v1/chat/send-message', {
      user_id: options.userId || getUserId(),
      conversation_id: conversationId,
      text: message.content || message.text || message,
      model: options.model || import.meta.env.VITE_DEFAULT_AI_MODEL || 'claude',
      voice: options.voice ?? true,
    })
  },

  async sendVoiceMessage(audioBlob, conversationId, options = {}) {
    const form = new FormData()
    form.append('file', audioBlob, 'voice-message.webm')
    const transcript = await api.post('/api/v1/voice/transcribe', form)
    const text = transcript.text || transcript.transcript
    const response = await this.sendMessage(conversationId, text, options)
    return { transcript, ...response }
  },

  async deleteMessage(messageId) {
    await api.delete(`/api/v1/chat/messages/${messageId}?user_id=${encodeURIComponent(getUserId())}`)
    return true
  },

  async searchConversations(query) {
    const conversations = await this.getConversations()
    const lowerQuery = query.toLowerCase()
    return conversations.filter((conversation) => (conversation.title || '').toLowerCase().includes(lowerQuery))
  },
}

export default ChatService
