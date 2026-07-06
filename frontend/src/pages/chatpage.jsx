import { useEffect, useMemo, useState } from 'react'
import ChatContainer from '../components/Chat/ChatContainer'
import ConversationList from '../components/Chat/ConversationList'
import AiraLogo from '../components/AiraLogo'
import Sidebar from '../components/Common/Sidebar'
import Button from '../components/Common/Button'
import Ballpit from '../components/Backgrounds/Ballpit'
import Toast from '../components/Common/Toast'
import SettingsLogo from '../components/Settings/SettingsLogo'
import { useChatContext } from '../context/ChatContext'
import { APP_NAME, ROUTES } from '../utils/constants'

function ChatPage({ navigate }) {
  const {
    conversations,
    currentConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    loadConversations,
  } = useChatContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [toast, setToast] = useState(null)

  const userId = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('aria-user') || '{}').id || 'guest' }
    catch { return 'guest' }
  }, [])

  useEffect(() => {
    if (!userId || userId === 'guest') return

    const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/^http/, 'ws')
    const token = localStorage.getItem('aria-token') || ''
    const ws = new WebSocket(`${WS_BASE}/ws/notifications/${userId}?token=${token}`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'notification') {
          setNotifications(prev => [{
            id: Date.now(),
            message: data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, ...prev])
        }
      } catch (err) {
        console.error('Notification WS error:', err)
      }
    }

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)

    return () => {
      clearInterval(pingInterval)
      ws.close()
    }
  }, [userId])

  const filteredConversations = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return conversations.filter((conversation) =>
      (conversation.title || '').toLowerCase().includes(query),
    )
  }, [conversations, searchQuery])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  useEffect(() => {
    loadConversations().catch(() => showToast('Unable to load conversations', 'error'))
  }, [loadConversations])

  const handleNewChat = async () => {
    await createConversation({ title: 'New conversation' })
    showToast('New conversation created', 'success')
  }

  const handleLogout = () => {
    navigate(ROUTES.LOGOUT)
  }

  const activeConversation = currentConversation || conversations[0] || null

  return (
    <main className="chat-layout">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'auto' }}>
        <Ballpit
          count={80}
          gravity={0.01}
          friction={0.9975}
          wallBounce={1}
          followCursor={true}
        />
      </div>
      <Sidebar
        title="Conversations"
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      >
        {conversations.length === 0 ? (
          <Button variant="primary" onClick={handleNewChat}>
            Start New Chat
          </Button>
        ) : (
          <>
            <div className="sidebar-section">
              <input
                className="sidebar-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search chats..."
              />
            </div>
            <ConversationList
              conversations={filteredConversations}
              currentId={activeConversation?.id}
              onSelect={selectConversation}
              onDelete={deleteConversation}
            />
          </>
        )}
        <div className="sidebar-section chat-nav-section" aria-label="Page connections">
          <Button variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)}>
            <SettingsLogo type="dashboard" size="sm" />
            Dashboard
          </Button>
          <Button variant="ghost" onClick={() => navigate(ROUTES.SETTINGS)}>
            <SettingsLogo type="settings" size="sm" />
            Settings
          </Button>
        </div>
      </Sidebar>

      <section className="chat-main">
        <header className="chat-header">
          <div className="chat-title-group">
            <div className="chat-header-logo">
              <AiraLogo className="chat-logo-canvas" width={400} height={380} />
            </div>
            <div>
              <p className="step-label">{APP_NAME} Chat</p>
              <h1>{activeConversation?.title || 'New conversation'}</h1>
            </div>
          </div>
          <div className="chat-header-actions">
            <div style={{ position: 'relative' }}>
              <Button
                variant="ghost"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <SettingsLogo type="notifications" size="sm" />
                Notifications
              </Button>
              {showNotifications && (
                <div className="notifications-dropdown" style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '340px',
                  background: '#09090b', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', padding: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
                  zIndex: 50, display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  <h3 style={{ margin: 0, color: '#f3f4f6', fontSize: '16px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>Recent Notifications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '12px', color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
                          <span style={{ fontSize: '14px', color: '#e5e7eb', lineHeight: '1.4' }}>{notif.message}</span>
                          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>{notif.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <SettingsLogo type="logout" size="sm" />
              Sign out
            </Button>
          </div>
        </header>

        {activeConversation ? (
          <ChatContainer conversationId={activeConversation.id} />
        ) : (
          <div className="chat-surface chat-empty">
            <div className="loading">
              <div className="chat-empty-logo">
                <AiraLogo className="chat-logo-canvas" width={400} height={380} />
              </div>
              <h2>Welcome to {APP_NAME}</h2>
              <p>Where Silence Finds Its Voice</p>
              <Button variant="primary" onClick={handleNewChat}>
                Start a conversation
              </Button>
            </div>
          </div>
        )}
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}

export default ChatPage
