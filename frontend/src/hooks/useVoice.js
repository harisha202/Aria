import { useCallback, useEffect, useRef, useState } from 'react'
import VoiceService from '../services/voice.service'

export const useVoice = ({ language = 'en-US', maxDuration = 15000 } = {}) => {
  const timerRef = useRef(null)
  const levelTimerRef = useRef(null)
  const startedAtRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [duration, setDuration] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const clearTimers = useCallback(() => {
    window.clearTimeout(timerRef.current)
    window.clearInterval(levelTimerRef.current)
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setTranscript('')
    try {
      await VoiceService.startRecording()
      startedAtRef.current = Date.now()
      setDuration(0)
      setIsRecording(true)

      levelTimerRef.current = window.setInterval(() => {
        const levels = VoiceService.getWaveformData()
        const average = levels.reduce((sum, value) => sum + value, 0) / (levels.length || 1)
        setAudioLevel(average)
        setDuration(Date.now() - startedAtRef.current)
      }, 120)

      timerRef.current = window.setTimeout(() => {
        stopRecording()
      }, maxDuration)
    } catch (err) {
      setError(err.message || 'Microphone access failed')
      setIsRecording(false)
    }
  }, [maxDuration])

  const stopRecording = useCallback(async () => {
    clearTimers()
    setIsRecording(false)
    setAudioLevel(0)
    const blob = await VoiceService.stopRecording()
    return blob
  }, [clearTimers])

  const transcribe = useCallback(
    async (audioBlob) => {
      if (!audioBlob) return ''
      try {
        const result = await VoiceService.transcribeAudio(audioBlob, language)
        const text = result.text || result.transcript || ''
        setTranscript(text)
        return text
      } catch (err) {
        setError(err.message || 'Unable to transcribe audio')
        throw err
      }
    },
    [language],
  )

  const playAudio = useCallback((audioBase64, contentType = 'audio/mpeg') => {
    if (!audioBase64) return null
    const audio = VoiceService.playAudio(audioBase64, contentType)
    setIsSpeaking(true)
    audio.onended = () => setIsSpeaking(false)
    return audio
  }, [])

  const stopAudio = useCallback(() => {
    VoiceService.stopPlayback()
    setIsSpeaking(false)
  }, [])

  const clearTranscript = useCallback(() => setTranscript(''), [])

  useEffect(() => clearTimers, [clearTimers])

  return {
    isRecording,
    isListening: isRecording,
    audioLevel,
    duration,
    transcript,
    fullTranscript: transcript,
    error,
    isSpeaking,
    startRecording,
    startListening: startRecording,
    stopRecording,
    stopListening: stopRecording,
    transcribe,
    clearTranscript,
    resetTranscript: clearTranscript,
    playAudio,
    stopAudio,
  }
}

export default useVoice
