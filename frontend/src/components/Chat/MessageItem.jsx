import { formatTime } from '../../utils/formatters'
import VoiceService from '../../services/voice.service'

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
      <p className="message-text">{text}</p>
      {message.voiceTranscript && <p className="message-text muted">{message.voiceTranscript}</p>}
      <div className="message-actions">
        <button type="button" onClick={copyText}>Copy</button>
        {role === 'user' && <button type="button" onClick={() => onRetry?.(message)}>Retry</button>}
        {audioBase64 && (
          <button type="button" onClick={() => VoiceService.playAudio(audioBase64, 'audio/mpeg')}>
            Play
          </button>
        )}
        {onDelete && <button type="button" onClick={() => onDelete(message.id)}>Delete</button>}
      </div>
    </article>
  )
}

export default MessageItem
