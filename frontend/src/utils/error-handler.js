export const ErrorHandler = {
  formatError(error) {
    if (!error) return 'Something went wrong'
    if (typeof error === 'string') return error
    return error.message || 'Something went wrong'
  },

  logError(error, metadata = {}) {
    console.error('[ARIA]', error, metadata)
  },

  handle(error, context = 'Application') {
    const message = this.formatError(error)
    this.logError(error, { context })
    return message
  },

  showErrorToast(error, showToast) {
    const message = this.formatError(error)
    showToast?.(message, 'error')
    return message
  },
}

export default ErrorHandler
