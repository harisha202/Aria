export class WebSocketService {
  constructor(url) {
    this.url = url
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    this.socket = new WebSocket(this.url)
    this.socket.onopen = (event) => this.emit('connection:open', event)
    this.socket.onclose = (event) => this.emit('connection:close', event)
    this.socket.onerror = (event) => this.emit('connection:error', event)
    this.socket.onmessage = (event) => this.emit('message:received', event)
    return this.socket
  }

  disconnect() {
    this.socket?.close()
  }

  send(message) {
    if (this.socket?.readyState !== WebSocket.OPEN) return false
    this.socket.send(typeof message === 'string' ? message : JSON.stringify(message))
    return true
  }

  on(event, callback) {
    const callbacks = this.listeners.get(event) || new Set()
    callbacks.add(callback)
    this.listeners.set(event, callbacks)
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback)
  }

  emit(event, payload) {
    this.listeners.get(event)?.forEach((callback) => callback(payload))
  }
}

export default WebSocketService
