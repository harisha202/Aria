import { useCallback, useEffect, useMemo, useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { useChatContext } from '../../context/ChatContext'
import { useVoice } from '../../hooks/useVoice'
import { useWebSocket } from '../../hooks/useWebSocket'

import VoiceService from '../../services/voice.service'
import MessageList from './MessageList'
import InputBar from './InputBar'
import { ChatService } from '../../services/chat.service'
import { WikipediaService } from '../../services/wikipedia.service'
import Toast from '../Common/Toast'

const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000')
  .replace(/^http/, 'ws')

function ChatContainer({ conversationId }) {
  const { messages, setMessages, isLoading } = useChat({
    storageKey: `aira-chat-${conversationId}`,
  })
  const [selectedModel, setSelectedModel] = useState(
    import.meta.env.VITE_DEFAULT_AI_MODEL || 'claude',
  )
  const [voiceReplies, setVoiceReplies] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aria-voice-settings') || '{}')
      return saved.autoPlay ?? true
    } catch {
      return true
    }
  })
  const [selectedPersona, setSelectedPersona] = useState('default')
  const [error, setError] = useState('')
  const [streamingId, setStreamingId] = useState(null)   // id of the in-progress assistant bubble
  const [isTyping, setIsTyping] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const isStreaming = Boolean(streamingId)

  const userId = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('aria-user') || '{}').id || 'guest' }
    catch { return 'guest' }
  }, [])
  
  const userName = useMemo(() => {
    try { 
      const user = JSON.parse(localStorage.getItem('aria-user') || '{}')
      return user.name ? user.name.split(' ')[0] : 'there'
    }
    catch { return 'there' }
  }, [])

  const wsUrl = conversationId
    ? `${WS_BASE}/ws/${userId}/${conversationId}?token=${localStorage.getItem('aria-token') || ''}`
    : null

  // ── WebSocket streaming ────────────────────────────────────────────
  const { sendMessage: wsSend, isOpen: wsIsOpen } = useWebSocket(wsUrl, {
    reconnect: true,
    onMessage: useCallback((event) => {
      let data
      try { data = JSON.parse(event.data) } catch { return }

      if (data.type === 'typing') {
        setIsTyping(true)
        return
      }

      if (data.type === 'stream.chunk') {
        setIsTyping(false)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          // Append to the streaming bubble if it already exists
          if (last && last._streaming) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: m.content + data.chunk } : m,
            )
          }
          // Create a new streaming bubble
          const id = `streaming-${Date.now()}`
          setStreamingId(id)
          return [
            ...prev,
            {
              id,
              role: 'assistant',
              content: data.chunk,
              _streaming: true,
              createdAt: new Date().toISOString(),
            },
          ]
        })
        return
      }

      if (data.type === 'stream.end') {
        // Replace streaming flag with final text + model badge
        setMessages((prev) =>
          prev.map((m) =>
            m._streaming
              ? { ...m, content: data.text, _streaming: false, ai_model: data.model }
              : m,
          ),
        )
        setStreamingId(null)
        setIsTyping(false)
        return
      }

      if (data.type === 'message.saved' && data.message && !data.message._streaming) {
        // Server persisted a message — update the local copy with the DB id
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.message.id || m._streaming ? data.message : m,
          ),
        )
      }
    }, [setMessages]),
  })

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

  // Load messages on mount
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
    return () => { ignore = true }
  }, [conversationId, setMessages])

  // ── Send via WebSocket when connected, fall back to REST ──────────
  const handleSend = useCallback(
    async (payload) => {
      setError('')
      const text = typeof payload === 'string' ? payload.trim() : payload.text?.trim()
      const image = typeof payload === 'object' ? payload.image : null
      
      if (!text && !image) return null

      setIsGenerating(true)

      // Optimistic user bubble
      const userBubble = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        image: image, // Store local base64 preview
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userBubble])

      if (text && text.toLowerCase().startsWith('/wiki ')) {
        const query = text.slice(6).trim()
        if (query) {
          try {
            const data = await WikipediaService.search(query)
            setMessages((prev) => [
              ...prev,
              {
                id: `wiki-${Date.now()}`,
                role: 'assistant',
                content: data.found 
                  ? `### ${data.title}\n\n${data.extract}\n\n[Source](${data.url})`
                  : `I couldn't find a Wikipedia article for "${query}".`,
                ai_model: 'wikipedia',
                createdAt: new Date().toISOString(),
              }
            ])
          } catch (err) {
            setError(err.message || 'Wikipedia lookup failed.')
          } finally {
            setIsGenerating(false)
          }
          return userBubble
        }
      }

      if (wsIsOpen) {
        // WebSocket path
        setIsGenerating(false) // websocket events handle typing state
        wsSend({ 
          type: 'message', 
          text: text, 
          image: image,
          model: selectedModel,
          persona: selectedPersona
        })
      } else {
        // REST fallback
        try {
          const savedVoice = JSON.parse(localStorage.getItem('aria-voice-settings') || '{}')
          const response = await ChatService.sendMessage(conversationId, text, {
            model: selectedModel,
            persona: selectedPersona,
            voice: voiceReplies,
            image: image,
            voiceName: savedVoice.voice,
            languageCode: savedVoice.language
          })
          if (voiceReplies && response.audio?.audio_base64) {
            VoiceService.playAudio(response.audio.audio_base64, response.audio.content_type, savedVoice.rate)
          }
          if (response.ai_message) {
            setMessages((prev) => [...prev, response.ai_message])
          }
        } catch (err) {
          setError(err.message || 'ARIA could not send that message.')
        } finally {
          setIsGenerating(false)
        }
      }
      return userBubble
    },
    [
      wsIsOpen,
      wsSend,
      selectedModel,
      selectedPersona,
      voiceReplies,
      conversationId,
      setMessages,
    ],
  )

  const handleStopStream = useCallback(() => {
    if (wsIsOpen && isStreaming) {
      wsSend({ type: 'stop' })
      setStreamingId(null)
      setIsTyping(false)
    }
  }, [wsIsOpen, isStreaming, wsSend])

  const handleExport = useCallback(() => {
    const text = messages.map(m => `**${m.role}**: ${m.content}`).join('\n\n')
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aria-chat-${conversationId || 'export'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [messages, conversationId])

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

  const handleDelete = useCallback(
    async (messageId) => {
      try {
        await ChatService.deleteMessage(messageId)
        setMessages((current) => current.filter((m) => m.id !== messageId))
      } catch (err) {
        setError(err.message || 'Unable to delete message.')
      }
    },
    [setMessages],
  )

  const handleRetry = useCallback(
    (message) => {
      const text = message?.content || message?.text
      if (text) handleSend(text)
    },
    [handleSend],
  )

  return (
    <section className="chat-surface" aria-label="Chat messages" style={{ position: 'relative' }}>
      {messages.length === 0 && !isLoading && (
        <div className="chat-starters" aria-label="Useful starter prompts">
          <div style={{ textAlign: 'center' }}>
            <h1 className="step-label" style={{ fontSize: '2rem', marginBottom: '8px' }}>Hi {userName}, Start With A Real Task</h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text)' }}>Ask ARIA to plan, write, explain, or summarize.</p>
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

      {error && <Toast message={error} onClose={() => setError('')} type="error" />}

      <MessageList
        messages={messages}
        isLoading={(isLoading || isGenerating || isTyping) && !streamingId}
        onRetry={handleRetry}
        onDelete={handleDelete}
      />
      <InputBar
        onSend={handleSend}
        onVoiceStart={startRecording}
        onVoiceStop={handleStopVoice}
        onStopGeneration={handleStopStream}
        isListening={isRecording}
        isStreaming={isStreaming}
        audioLevel={audioLevel}
        duration={duration}
        disabled={isLoading && !isStreaming}
        settingsDropdown={
          <div className="chat-settings-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button 
              type="button"
              className="icon-button settings-btn" 
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Chat Settings"
              style={{ fontSize: '20px', padding: '6px 14px', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)' }}
            >
              ⋮
            </button>
            {showSettings && (
              <div className="chat-toolbar dropdown-menu" style={{ 
                position: 'absolute', bottom: '100%', left: 0, marginBottom: '16px',
                flexDirection: 'column', alignItems: 'flex-start', minWidth: '240px',
                background: '#09090b', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '20px', boxShadow: '0 -8px 32px rgba(0,0,0,0.8)',
                zIndex: 11
              }}>
                <div className="chat-status" style={{ marginBottom: '16px', color: '#f3f4f6', fontWeight: 600 }}>
                  <span className={`status-dot ${wsIsOpen ? 'status-dot--live' : 'status-dot--rest'}`} aria-hidden="true" />
                  <span>{wsIsOpen ? 'Live streaming' : 'Standard mode'}</span>
                </div>
                <label className="chat-control" style={{ width: '100%', justifyContent: 'space-between', marginBottom: '14px', color: '#9ca3af', fontSize: '14px' }}>
                  <span>Model</span>
                  <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={{ padding: '6px 12px', background: '#18181b', color: '#ffffff', border: '1px solid #27272a', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}>
                    <option value="claude">Claude</option>
                    <option value="gemini">Gemini</option>
                  </select>
                </label>
                <label className="chat-control" style={{ width: '100%', justifyContent: 'space-between', marginBottom: '14px', color: '#9ca3af', fontSize: '14px' }}>
                  <span>Persona</span>
                  <select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)} style={{ padding: '6px 12px', background: '#18181b', color: '#ffffff', border: '1px solid #27272a', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}>
                    <option value="default">Default</option>
                    <option value="programmer">Programmer</option>
                    <option value="creative">Creative Writer</option>
                    <option value="sarcastic">Sarcastic Friend</option>
                  </select>
                </label>
                <label className="chat-toggle" style={{ width: '100%', marginBottom: '20px', color: '#9ca3af', fontSize: '14px' }}>
                  <input type="checkbox" checked={voiceReplies} onChange={(e) => setVoiceReplies(e.target.checked)} style={{ accentColor: 'var(--primary-color)', width: '16px', height: '16px', cursor: 'pointer' }} />
                  <span>Speak replies</span>
                </label>
                <button type="button" className="icon-button export-btn" onClick={handleExport} aria-label="Export Chat" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 0 0', borderTop: '1px solid #27272a', borderRadius: 0, color: '#d1d5db', fontSize: '14px', background: 'transparent' }}>
                  ⬇️ Export Chat
                </button>
              </div>
            )}
          </div>
        }
      />
    </section>
  )
}

export default ChatContainer
