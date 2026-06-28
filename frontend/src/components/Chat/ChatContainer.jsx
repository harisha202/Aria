import { useCallback, useEffect, useMemo, useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { useChatContext } from '../../context/ChatContext'
import { useVoice } from '../../hooks/useVoice'

import VoiceService from '../../services/voice.service'
import MessageList from './MessageList'
import InputBar from './InputBar'
import { ChatService } from '../../services/chat.service'



function ChatContainer({ conversationId }) {
  const { messages, setMessages, isLoading, sendMessage } = useChat({ storageKey: `aira-chat-${conversationId}` })
  const { currentConversation, updateConversation } = useChatContext()
  const [selectedModel, setSelectedModel] = useState(import.meta.env.VITE_DEFAULT_AI_MODEL || 'claude')
  const [voiceReplies, setVoiceReplies] = useState(true)
  const [error, setError] = useState('')
  const {
    isRecording,
    startRecording,
    stopRecording,
    transcribe,
    audioLevel,
    duration,
    clearTranscript,
  } = useVoice()

  const starterPrompts = useMemo(
    () => [
      'Summarize this into clear action items: ',
      'Help me plan my day around these priorities: ',
      'Draft a polite email reply saying: ',
      'Explain this simply and give one example: ',
    ],
    [],
  )

  useEffect(() => {
    let ignore = false
    const loadMessages = async () => {
      if (!conversationId) return
      try {
        const loaded = await ChatService.getMessages(conversationId)
        if (!ignore) setMessages(loaded)
      } catch {
        if (!ignore) setMessages([])
      }
    }
    loadMessages()
    return () => {
      ignore = true
    }
  }, [conversationId, setMessages])

  const handleSend = useCallback(async (text) => {
    setError('')
    try {
      const aiMessage = await sendMessage(text, async () => {
        const response = await ChatService.sendMessage(conversationId, text, {
          model: selectedModel,
          voice: voiceReplies,
        })
        if (voiceReplies && response.audio?.audio_base64) {
          VoiceService.playAudio(response.audio.audio_base64, response.audio.content_type)
        }
        return response.ai_message
      })

      await updateConversation(conversationId, {
        last_message: text,
        message_count: (currentConversation?.message_count || 0) + 1,
      })

      return aiMessage
    } catch (err) {
      setError(err.message || 'ARIA could not send that message.')
      return null
    }
  }, [conversationId, currentConversation, selectedModel, sendMessage, updateConversation, voiceReplies])



  const handleStopVoice = useCallback(async () => {
    setError('')
    try {
      const audioBlob = await stopRecording()
      const transcript = await transcribe(audioBlob)
      if (transcript) {
        await handleSend(transcript)
        clearTranscript()
      }
    } catch (err) {
      setError(err.message || 'Unable to process voice message.')
    }
  }, [clearTranscript, handleSend, stopRecording, transcribe])

  const handleRetry = useCallback(
    (message) => {
      const text = message?.content || message?.text
      if (text) handleSend(text)
    },
    [handleSend],
  )

  const handleDelete = useCallback(
    async (messageId) => {
      try {
        await ChatService.deleteMessage(messageId)
        setMessages((current) => current.filter((message) => message.id !== messageId))
      } catch (err) {
        setError(err.message || 'Unable to delete message.')
      }
    },
    [setMessages],
  )

  return (
    <section className="chat-surface" aria-label="Chat messages">
      <div className="chat-toolbar" aria-label="Chat controls">
        <div className="chat-status">
          <span className="status-dot" aria-hidden="true" />
          <span>Ready for text and voice</span>
        </div>
        <label className="chat-control">
          <span>Model</span>
          <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
          </select>
        </label>
        <label className="chat-toggle">
          <input
            type="checkbox"
            checked={voiceReplies}
            onChange={(event) => setVoiceReplies(event.target.checked)}
          />
          <span>Speak replies</span>
        </label>
      </div>

      {messages.length === 0 && !isLoading && (
        <div className="chat-starters" aria-label="Useful starter prompts">
          <div>
            <p className="step-label">Start With A Real Task</p>
            <h2>Ask ARIA to plan, write, explain, or summarize.</h2>
          </div>
          <div className="starter-grid">
            {starterPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => handleSend(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="chat-error" role="alert">{error}</div>}

      <MessageList messages={messages} isLoading={isLoading} onRetry={handleRetry} onDelete={handleDelete} />
      <InputBar
        onSend={handleSend}
        onVoiceStart={startRecording}
        onVoiceStop={handleStopVoice}
        isListening={isRecording}
        audioLevel={audioLevel}
        duration={duration}
        disabled={isLoading}
      />
    </section>
  )
}

export default ChatContainer
