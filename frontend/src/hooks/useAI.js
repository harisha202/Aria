import { useCallback, useState } from 'react'
import AIService from '../services/ai.service'

export const useAI = (initialModel = import.meta.env.VITE_DEFAULT_AI_MODEL || 'claude') => {
  const [aiResponse, setAIResponse] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [selectedModel, setSelectedModel] = useState(initialModel)

  const sendPrompt = useCallback(
    async (text, conversationId) => {
      setIsThinking(true)
      try {
        const response = await AIService.sendPrompt(text, conversationId, selectedModel)
        setAIResponse(response.response || '')
        return response
      } finally {
        setIsThinking(false)
      }
    },
    [selectedModel],
  )

  const streamPrompt = useCallback(
    async (text, conversationId, onChunk) => {
      setIsThinking(true)
      setAIResponse('')
      try {
        return await AIService.streamPrompt(text, conversationId, (chunk) => {
          setAIResponse((current) => `${current}${chunk}`)
          onChunk?.(chunk)
        }, selectedModel)
      } finally {
        setIsThinking(false)
      }
    },
    [selectedModel],
  )

  const setModel = useCallback(async (model) => {
    setSelectedModel(model)
    await AIService.setModel(model)
  }, [])

  return { aiResponse, isThinking, selectedModel, sendPrompt, streamPrompt, setModel }
}

export default useAI
