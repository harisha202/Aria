export const NotificationService = {
  async requestPermission() {
    if (!('Notification' in window)) return 'denied'
    return Notification.requestPermission()
  },

  isEnabled() {
    return 'Notification' in window && Notification.permission === 'granted'
  },

  show(title, options = {}) {
    if (!this.isEnabled()) return null
    return new Notification(title, options)
  },
}

export default NotificationService
