import { useEffect, useState } from 'react'
import SettingsLogo from './SettingsLogo'

const VOICE_OPTIONS = [
  { value: 'en-US-Neural2-F', label: 'Aria (Google Neural F)' },
  { value: 'en-US-Neural2-D', label: 'Echo (Google Neural D)' },
  { value: 'en-US-Neural2-C', label: 'Nova (Google Neural C)' },
  { value: 'hi-IN-Neural2-A', label: 'Priya (Hindi Neural A)' },
  { value: 'default', label: 'Browser Default' },
]

const STORAGE_KEY = 'aria-voice-settings'

const loadSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function VoiceSettings() {
  const saved = loadSettings()
  const [voice, setVoice] = useState(saved.voice || 'en-US-Neural2-F')
  const [rate, setRate] = useState(saved.rate ?? 1.0)
  const [autoPlay, setAutoPlay] = useState(saved.autoPlay ?? true)
  const [language, setLanguage] = useState(saved.language || 'en-US')

  useEffect(() => {
    const settings = { voice, rate, autoPlay, language }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [voice, rate, autoPlay, language])

  return (
    <section className="settings-form">
      <div className="settings-panel-heading">
        <SettingsLogo type="voice" size="lg" />
        <h1>Voice</h1>
      </div>

      <fieldset className="settings-fieldset">
        <legend>Text-to-Speech</legend>

        <label>
          Voice
          <select value={voice} onChange={(e) => setVoice(e.target.value)}>
            {VOICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Language
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="hi-IN">Hindi</option>
          </select>
        </label>

        <label>
          Speech Rate — <strong>{rate.toFixed(1)}×</strong>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
          />
        </label>

        <label className="settings-toggle-label">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
          />
          Auto-play AI voice replies
        </label>
      </fieldset>
    </section>
  )
}

export default VoiceSettings
