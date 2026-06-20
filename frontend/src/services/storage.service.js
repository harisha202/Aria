import StorageUtils from '../utils/storage-utils'

const CONVERSATIONS_KEY = 'aira-conversations'
const SETTINGS_KEY = 'aira-settings'
const VOICE_PREFS_KEY = 'aira-voice-preferences'

export const StorageService = {
  saveConversations(data) {
    return StorageUtils.setItem(CONVERSATIONS_KEY, data)
  },

  getConversations() {
    return StorageUtils.getItem(CONVERSATIONS_KEY, [])
  },

  saveDraft(conversationId, text) {
    return StorageUtils.setItem(`aira-draft-${conversationId}`, text)
  },

  getDraft(conversationId) {
    return StorageUtils.getItem(`aira-draft-${conversationId}`, '')
  },

  deleteDraft(conversationId) {
    StorageUtils.removeItem(`aira-draft-${conversationId}`)
  },

  saveVoicePrefs(preferences) {
    return StorageUtils.setItem(VOICE_PREFS_KEY, preferences)
  },

  getVoicePrefs() {
    return StorageUtils.getItem(VOICE_PREFS_KEY, {})
  },

  saveSettings(settings) {
    return StorageUtils.setItem(SETTINGS_KEY, settings)
  },

  getSettings() {
    return StorageUtils.getItem(SETTINGS_KEY, {})
  },
}

export default StorageService
