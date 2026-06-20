import { useEffect } from 'react'

function Toast({ message, type = 'info', duration = 3000, onClose }) {
  useEffect(() => {
    if (!onClose) return undefined

    const timer = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}

export default Toast
