import { formatTime } from '../../utils/formatters'
import VoiceService from '../../services/voice.service'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'

function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  
  const handleCopy = async () => {
    await navigator.clipboard?.writeText(String(children).replace(/\n$/, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!inline && match) {
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-language">{match[1]}</span>
          <button type="button" className="code-copy-btn" onClick={handleCopy}>
            {copied ? 'Copied! ✅' : 'Copy'}
          </button>
        </div>
        <pre className={className} {...props}>
          <code className={className}>
            {children}
          </code>
        </pre>
      </div>
    )
  }
  
  return (
    <code className={className} {...props}>
      {children}
    </code>
  )
}

function MessageItem({ message, onRetry, onDelete }) {
  const role = message.role || message.sender_type || 'assistant'
  const audioBase64 = message.audioBase64 || message.audio_base64
  const text = message.content || message.text || ''

  const copyText = async () => {
    await navigator.clipboard?.writeText(text)
  }

  return (
    <article className={`message-item ${role}`}>
      <div className="message-meta">
        <strong>{role === 'user' ? 'You' : role === 'system' ? 'System' : 'ARIA'}</strong>
        <span>{formatTime(message.createdAt || message.created_at)}</span>
      </div>
      
      {message.image && (
        <div className="message-image-container">
          <img src={message.image} alt="Uploaded attachment" className="message-attached-image" />
        </div>
      )}
      
      <div className="message-text">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            code: CodeBlock
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
      
      {message.voiceTranscript && <p className="message-text muted"><em>Transcript:</em> {message.voiceTranscript}</p>}
      
      <div className="message-actions">
        <button type="button" onClick={copyText}>Copy Text</button>
        {role === 'user' && <button type="button" onClick={() => onRetry?.(message)}>Retry</button>}
        {audioBase64 && (
          <button type="button" onClick={() => VoiceService.playAudio(audioBase64, 'audio/mpeg')}>
            Play Audio
          </button>
        )}
        {onDelete && <button type="button" onClick={() => onDelete(message.id)}>Delete</button>}
      </div>
    </article>
  )
}

export default MessageItem
