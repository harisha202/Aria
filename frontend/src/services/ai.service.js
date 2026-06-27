import api from './api'

export const AIService = {
  async sendPrompt(text, conversationId, model) {
    return api.post('/api/v1/ai/chat', {
      message: text,
      conversation_id: conversationId,
      model: model || import.meta.env.VITE_DEFAULT_AI_MODEL || 'claude',
    })
  },

  async streamPrompt(text, conversationId, onChunk, model) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/ai/chat-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('aria-token')
          ? { Authorization: `Bearer ${localStorage.getItem('aria-token')}` }
          : {}),
      },
      body: JSON.stringify({
        message: text,
        conversation_id: conversationId,
        model: model || import.meta.env.VITE_DEFAULT_AI_MODEL || 'claude',
      }),
    })

    if (!response.ok || !response.body) {
      throw new Error(`AI stream failed with status ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      const text = chunk
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => line.replace(/^data: /, ''))
        .join('')
      if (text) {
        fullText += text
        onChunk?.(text)
      }
    }

    return fullText
  },

  async setModel(modelName) {
    return api.post('/api/v1/ai/set-model', { model: modelName })
  },

  async getAvailableModels() {
    const data = await api.get('/api/v1/ai/models')
    return data.models || []
  },
}

export default AIService
