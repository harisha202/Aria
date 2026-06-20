import { useState } from 'react'
import VoiceButton from './VoiceButton'
import VoiceVisualizer from './VoiceVisualizer'

function InputBar({
  onSend,
  onVoiceStart,
  onVoiceStop,
  isListening = false,
  audioLevel = 0,
  duration = 0,
  disabled = false,
}) {
  const [value, setValue] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const text = value.trim()
    if (!text) return

    onSend?.(text)
    setValue('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form className="chat-input-bar" onSubmit={handleSubmit}>
      <VoiceButton
        isListening={isListening}
        onStart={onVoiceStart}
        onStop={onVoiceStop}
        disabled={disabled}
      />
      <VoiceVisualizer isRecording={isListening} audioLevel={audioLevel} duration={duration} />
      <textarea
        className="chat-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message ARIA..."
        rows={1}
        disabled={disabled}
      />
      <button type="submit" className="icon-button" disabled={disabled || !value.trim()}>
        <span className="send-icon" aria-hidden="true" />
        <span className="sr-only">Send message</span>
      </button>
    </form>
  )
}

export default InputBar
