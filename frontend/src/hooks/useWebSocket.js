import { useCallback, useEffect, useRef, useState } from 'react'

const READY_STATE = {
  connecting: WebSocket.CONNECTING,
  open: WebSocket.OPEN,
  closing: WebSocket.CLOSING,
  closed: WebSocket.CLOSED,
}

export const useWebSocket = (url, options = {}) => {
  const {
    enabled = Boolean(url),
    protocols,
    reconnect = false,
    reconnectDelay = 1500,
    maxReconnectAttempts = 3,
    onOpen,
    onMessage,
    onError,
    onClose,
  } = options

  const socketRef = useRef(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimerRef = useRef(null)
  const shouldReconnectRef = useRef(reconnect)
  const [socket, setSocket] = useState(null)
  const [readyState, setReadyState] = useState(READY_STATE.closed)
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    shouldReconnectRef.current = reconnect
  }, [reconnect])

  const close = useCallback((code = 1000, reason = 'Client closed connection') => {
    shouldReconnectRef.current = false
    window.clearTimeout(reconnectTimerRef.current)
    socketRef.current?.close(code, reason)
  }, [])

  const sendMessage = useCallback((message) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return false

    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    socketRef.current.send(payload)
    return true
  }, [])

  useEffect(() => {
    if (!enabled || !url) return undefined

    let socket
    let closedByEffect = false

    const connect = () => {
      socket = new WebSocket(url, protocols)
      socketRef.current = socket
      setSocket(socket)
      setReadyState(socket.readyState)
      setError(null)

      socket.onopen = (event) => {
        reconnectCountRef.current = 0
        setReadyState(socket.readyState)
        onOpen?.(event)
      }

      socket.onmessage = (event) => {
        setLastMessage(event)
        onMessage?.(event)
      }

      socket.onerror = (event) => {
        setError(event)
        onError?.(event)
      }

      socket.onclose = (event) => {
        setReadyState(socket.readyState)
        onClose?.(event)

        const canReconnect =
          !closedByEffect &&
          shouldReconnectRef.current &&
          reconnectCountRef.current < maxReconnectAttempts

        if (canReconnect) {
          reconnectCountRef.current += 1
          reconnectTimerRef.current = window.setTimeout(connect, reconnectDelay)
        }
      }
    }

    connect()

    return () => {
      closedByEffect = true
      window.clearTimeout(reconnectTimerRef.current)
      socket?.close(1000, 'Component unmounted')
      setSocket(null)
    }
  }, [
    enabled,
    maxReconnectAttempts,
    onClose,
    onError,
    onMessage,
    onOpen,
    protocols,
    reconnectDelay,
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
