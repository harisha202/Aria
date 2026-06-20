const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000)
  return `0:${String(seconds).padStart(2, '0')}`
}

function VoiceVisualizer({ isRecording = false, audioLevel = 0, duration = 0, levels }) {
  const bars = levels || [0.24, 0.42, 0.3, 0.56, 0.36].map((level, index) => {
    const pulse = isRecording ? Math.max(level, audioLevel + index * 0.035) : 0.08
    return Math.min(1, pulse)
  })

  return (
    <div className="voice-visualizer" aria-hidden={!isRecording}>
      {isRecording && <span className="voice-time">{formatDuration(duration)}</span>}
      {bars.map((level, index) => (
        <span
          className="voice-bar"
          key={`${level}-${index}`}
          style={{ height: isRecording ? `${Math.max(8, level * 100)}%` : '8px' }}
        />
      ))}
    </div>
  )
}

export default VoiceVisualizer
