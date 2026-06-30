import { useCallback, useEffect, useRef, useState } from 'react'

const READY_STATE = {
  connecting: WebSocket.CONNECTING,
  open: WebSocket.OPEN,
  closing: WebSocket.CLOSING,
  closed: WebSocket.CLOSED,
}

const DEFAULT_PING_INTERVAL = 25_000   // 25 s
const DEFAULT_RECONNECT_BASE = 1_500   // first retry after 1.5 s
const DEFAULT_MAX_RECONNECTS = 5

export const useWebSocket = (url, options = {}) => {
  const {
    enabled = Boolean(url),
    protocols,
    reconnect = true,
    reconnectDelay = DEFAULT_RECONNECT_BASE,
    maxReconnectAttempts = DEFAULT_MAX_RECONNECTS,
    pingInterval = DEFAULT_PING_INTERVAL,
    onOpen,
    onMessage,
    onError,
    onClose,
  } = options

  const socketRef = useRef(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimerRef = useRef(null)
  const pingTimerRef = useRef(null)
  const shouldReconnectRef = useRef(reconnect)
  const [socket, setSocket] = useState(null)
  const [readyState, setReadyState] = useState(READY_STATE.closed)
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    shouldReconnectRef.current = reconnect
  }, [reconnect])

  const stopPing = useCallback(() => {
    window.clearInterval(pingTimerRef.current)
    pingTimerRef.current = null
  }, [])

  const startPing = useCallback((ws) => {
    stopPing()
    if (!pingInterval) return
    pingTimerRef.current = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, pingInterval)
  }, [pingInterval, stopPing])

  const close = useCallback((code = 1000, reason = 'Client closed connection') => {
    shouldReconnectRef.current = false
    window.clearTimeout(reconnectTimerRef.current)
    stopPing()
    socketRef.current?.close(code, reason)
  }, [stopPing])

  const sendMessage = useCallback((message) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return false
    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    socketRef.current.send(payload)
    return true
  }, [])

  useEffect(() => {
    if (!enabled || !url) return undefined

    let ws
    let closedByEffect = false

    const connect = () => {
      ws = new WebSocket(url, protocols)
      socketRef.current = ws
      setSocket(ws)
      setReadyState(ws.readyState)
      setError(null)

      ws.onopen = (event) => {
        reconnectCountRef.current = 0
        setReadyState(ws.readyState)
        startPing(ws)
        onOpen?.(event)
      }

      ws.onmessage = (event) => {
        // Silently ignore pong frames — they are heartbeat responses only
        try {
          const data = JSON.parse(event.data)
          if (data?.type === 'pong') return
        } catch {
          /* non-JSON message — pass through */
        }
        setLastMessage(event)
        onMessage?.(event)
      }

      ws.onerror = (event) => {
        setError(event)
        onError?.(event)
      }

      ws.onclose = (event) => {
        setReadyState(ws.readyState)
        stopPing()
        onClose?.(event)

        const delay =
          reconnectDelay * Math.pow(1.5, reconnectCountRef.current)   // exponential back-off
        const canReconnect =
          !closedByEffect &&
          shouldReconnectRef.current &&
          reconnectCountRef.current < maxReconnectAttempts

        if (canReconnect) {
          reconnectCountRef.current += 1
          reconnectTimerRef.current = window.setTimeout(connect, delay)
        }
      }
    }

    connect()

    return () => {
      closedByEffect = true
      window.clearTimeout(reconnectTimerRef.current)
      stopPing()
      ws?.close(1000, 'Component unmounted')
      setSocket(null)
    }
  }, [
    enabled,
    maxReconnectAttempts,
    onClose,
    onError,
    onMessage,
    onOpen,
    pingInterval,
    protocols,
    reconnectDelay,
    startPing,
    stopPing,
    url,
  ])

  return {
    socket,
    readyState,
    lastMessage,
    error,
    isConnecting: readyState === READY_STATE.connecting,
    isOpen: readyState === READY_STATE.open,
    isClosing: readyState === READY_STATE.closing,
    isClosed: readyState === READY_STATE.closed,
    sendMessage,
    close,
  }
}

export default useWebSocket
