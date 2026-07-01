import React from 'react'
import Button from '../Common/Button'

function QuickActions({ onNewChat, onChat }) {
  return (
    <div className="quick-actions-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button variant="primary" onClick={onNewChat} style={{ boxShadow: '0 0 16px rgba(var(--primary-rgb), 0.5)' }}>
        New Conversation
      </Button>
      <Button variant="secondary" onClick={onChat}>
        Continue Chat
      </Button>
    </div>
  )
}

export default QuickActions
