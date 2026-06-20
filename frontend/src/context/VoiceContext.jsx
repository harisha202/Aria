/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import VoiceService from '../services/voice.service'

const VoiceContext = createContext(null)

export const VoiceProvider = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [voicePreference, setVoicePreference] = useState('default')
  const [voiceLevel, setVoiceLevel] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const availableVoices = VoiceService.getVoiceOptions()

  const playAudio = (blobOrBase64, contentType) => {
    const audio = VoiceService.playAudio(blobOrBase64, contentType)
    setIsSpeaking(true)
    audio.onended = () => setIsSpeaking(false)
    return audio
  }

  const stopAudio = () => {
    VoiceService.stopPlayback()
    setIsSpeaking(false)
  }

  const value = useMemo(
    () => ({
      isRecording,
      setIsRecording,
      audioLevel: voiceLevel,
      voiceLevel,
      setVoiceLevel,
      transcript,
      setTranscript,
      isSpeaking,
      availableVoices,
      voicePreference,
      setVoicePreference,
      playAudio,
      stopAudio,
    }),
    [availableVoices, isRecording, isSpeaking, transcript, voiceLevel, voicePreference],
  )

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}

export const useVoiceContext = () => {
  const context = useContext(VoiceContext)
  if (!context) {
    throw new Error('useVoiceContext must be used inside VoiceProvider')
  }
  return context
}

export default VoiceContext
