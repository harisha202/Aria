import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import ThinkingRobot from './ThinkingRobot'

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
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
          <ThinkingRobot />
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}

export default MessageList
