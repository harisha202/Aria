export const VoiceUtils = {
  getAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    return AudioContext ? new AudioContext() : null
  },

  createAudioAnalyzer(audioContext, stream) {
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    return analyser
  },

  calculateAudioLevel(analyser) {
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    const average = data.reduce((sum, value) => sum + value, 0) / data.length
    return Math.round((average / 255) * 100)
  },

  getFrequencyData(analyser) {
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    return Array.from(data)
  },

  audioToBlob(audioBuffer, type = 'audio/webm') {
    return new Blob([audioBuffer], { type })
  },

  blobToArrayBuffer(blob) {
    return blob.arrayBuffer()
  },
}

export default VoiceUtils
