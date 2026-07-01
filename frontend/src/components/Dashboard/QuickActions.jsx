import React from 'react'
import Button from '../Common/Button'

function QuickActions({ onNewChat, onChat, onSettings }) {
  return (
    <div className="quick-actions-card">
      <h3>Quick Actions</h3>
      <Button variant="primary" onClick={onNewChat}>
        New Conversation
      </Button>
      <Button variant="secondary" onClick={onChat}>
        Continue Chat
      </Button>
      <Button variant="secondary" onClick={onSettings}>
        Settings
      </Button>
    </div>
  )
}

export default QuickActions
