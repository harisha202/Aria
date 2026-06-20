function VoiceButton({ isListening = false, onStart, onStop, disabled = false }) {
  return (
    <button
      type="button"
      className={`voice-button ${isListening ? 'listening' : ''}`}
      onClick={isListening ? onStop : onStart}
      disabled={disabled}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      <span className={isListening ? 'voice-stop-icon' : 'voice-mic-icon'} aria-hidden="true" />
    </button>
  )
}

export default VoiceButton
