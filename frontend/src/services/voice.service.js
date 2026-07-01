import api from './api'

export class VoiceRecorder {
  constructor() {
    this.session = null
    this.audioContext = null
    this.analyser = null
  }

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    const chunks = []
    this.audioContext = new AudioContext()
    const source = this.audioContext.createMediaStreamSource(stream)
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256
    source.connect(this.analyser)

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.start()
    this.session = { recorder, chunks, stream, startedAt: Date.now() }
    return this.session
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.session) {
        resolve(null)
        return
      }
      const session = this.session
      session.recorder.onstop = () => {
        session.stream.getTracks().forEach((track) => track.stop())
        this.audioContext?.close()
        this.session = null
        resolve(new Blob(session.chunks, { type: 'audio/webm' }))
      }
      session.recorder.stop()
    })
  }

  getAudioData() {
    return this.stopRecording()?.then((blob) => blob?.arrayBuffer())
  }

  getWaveformData() {
    if (!this.analyser) return []
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    return Array.from(data).slice(0, 32).map((value) => value / 255)
  }

  async sendToBackend(audioBlob, languageCode = 'en-US') {
    const form = new FormData()
    form.append('file', audioBlob, 'voice-message.webm')
    return api.post(`/api/v1/voice/transcribe?language_code=${encodeURIComponent(languageCode)}`, form)
  }
}

export class VoicePlayer {
  constructor() {
    this.audio = null
  }

  playAudio(audioBlobOrBase64, contentType = 'audio/mpeg', rate = 1.0) {
    this.stopPlayback()
    const source =
      audioBlobOrBase64 instanceof Blob
        ? URL.createObjectURL(audioBlobOrBase64)
        : `data:${contentType};base64,${audioBlobOrBase64}`
    this.audio = new Audio(source)
    this.audio.playbackRate = rate
    this.audio.play()
    return this.audio
  }

  stopPlayback() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  setVolume(level) {
    if (this.audio) this.audio.volume = Math.max(0, Math.min(1, level))
  }

  isPlaying() {
    return Boolean(this.audio && !this.audio.paused)
  }
}

export const VoiceService = {
  recorder: new VoiceRecorder(),
  player: new VoicePlayer(),

  async startRecording() {
    return this.recorder.startRecording()
  },

  async stopRecording() {
    return this.recorder.stopRecording()
  },

  getWaveformData() {
    return this.recorder.getWaveformData()
  },

  async transcribeAudio(audioBlob, languageCode) {
    return this.recorder.sendToBackend(audioBlob, languageCode)
  },

  async synthesizeVoice(text, languageCode = 'en-US', voiceName) {
    return api.post('/api/v1/voice/speak', { text, language_code: languageCode, voice_name: voiceName })
  },

  playAudio(audioBlobOrBase64, contentType, rate = 1.0) {
    return this.player.playAudio(audioBlobOrBase64, contentType, rate)
  },

  stopPlayback() {
    this.player.stopPlayback()
  },

  getVoiceOptions() {
    return window.speechSynthesis?.getVoices?.() || []
  },
}

export default VoiceService
