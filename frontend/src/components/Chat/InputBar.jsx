import { useRef, useState } from 'react'
import VoiceButton from './VoiceButton'
import VoiceVisualizer from './VoiceVisualizer'

function InputBar({
  onSend,
  onVoiceStart,
  onVoiceStop,
  onStopGeneration,
  isListening = false,
  isStreaming = false,
  audioLevel = 0,
  duration = 0,
  disabled = false,
  settingsDropdown = null,
}) {
  const [value, setValue] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const text = value.trim()
    if (!text && !imagePreview) return

    onSend?.({ text, image: imagePreview })
    setValue('')
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <div className="input-bar-container">
      {imagePreview && (
        <div className="image-preview-area">
          <img src={imagePreview} alt="Preview" className="image-thumbnail" />
          <button 
            type="button" 
            className="clear-image-btn" 
            onClick={() => {
              setImagePreview(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}
      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/webp" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImageUpload}
        />
        <button 
          type="button" 
          className="icon-button attachment-btn" 
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isListening}
          aria-label="Attach Image"
          title="Attach Image"
        >
          📎
        </button>

        <VoiceButton
          isListening={isListening}
          onStart={onVoiceStart}
          onStop={onVoiceStop}
          disabled={disabled || Boolean(imagePreview)}
        />
        <VoiceVisualizer isRecording={isListening} audioLevel={audioLevel} duration={duration} />
        
        {settingsDropdown}
        <textarea
          className="chat-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={imagePreview ? "Add a message about this image..." : "Message ARIA, or type /wiki <topic>..."}
          rows={1}
          disabled={disabled || isListening}
        />

        {isStreaming ? (
          <button type="button" className="icon-button stop-btn" onClick={onStopGeneration} aria-label="Stop Generating" title="Stop Generating">
            ⏹️
          </button>
        ) : (
          <button type="submit" className="icon-button" disabled={disabled || (!value.trim() && !imagePreview)}>
            <span className="send-icon" aria-hidden="true" />
            <span className="sr-only">Send message</span>
          </button>
        )}
      </form>
    </div>
  )
}

export default InputBar
