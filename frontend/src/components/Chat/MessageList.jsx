import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'

function MessageList({ messages = [], isLoading = false, onRetry, onDelete }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} onRetry={onRetry} onDelete={onDelete} />
      ))}
      {isLoading && (
        <article className="message-item assistant">
          <div className="message-meta">
            <strong>ARIA</strong>
            <span>Typing</span>
          </div>
          <p className="message-text">Thinking...</p>
        </article>
      )}
      <div ref={endRef} />
    </div>
  )
}

export default MessageList
