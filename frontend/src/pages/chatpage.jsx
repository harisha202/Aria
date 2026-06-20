import { useEffect, useMemo, useState } from 'react'
import ChatContainer from '../components/Chat/ChatContainer'
import ConversationList from '../components/Chat/ConversationList'
import AiraLogo from '../components/AiraLogo'
import Ballpit from '../components/Backgrounds/Ballpit'
import Sidebar from '../components/Common/Sidebar'
import Toast from '../components/Common/Toast'
import SettingsLogo from '../components/Settings/SettingsLogo'
import { useChatContext } from '../context/ChatContext'
import { ROUTES } from '../utils/constants'

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
  const [toast, setToast] = useState(null)

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
    <main className="app-shell chat-layout">
      <div className="chat-ballpit-bg">
        <Ballpit count={150} gravity={0.01} friction={0.9975} wallBounce={1} followCursor={false} />
      </div>
      <Sidebar
        title="Conversations"
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      >
        <div className="sidebar-section">
          <button type="button" className="btn btn-primary" onClick={handleNewChat}>
            New Chat
          </button>
        </div>
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
        <div className="sidebar-section chat-nav-section" aria-label="Page connections">
          <button type="button" className="ghost-button" onClick={() => navigate(ROUTES.DASHBOARD)}>
            <SettingsLogo type="dashboard" size="sm" />
            Dashboard
          </button>
          <button type="button" className="ghost-button" onClick={() => navigate(ROUTES.SETTINGS)}>
            <SettingsLogo type="settings" size="sm" />
            Settings
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => navigate(ROUTES.SETTINGS, { state: { tab: 'notifications' } })}
          >
            <SettingsLogo type="notifications" size="sm" />
            Notifications
          </button>
        </div>
      </Sidebar>

      <section className="chat-main">
        <header className="chat-header">
          <div className="chat-title-group">
            <div className="chat-header-logo">
              <AiraLogo className="chat-logo-canvas" width={400} height={380} />
            </div>
            <div>
              <p className="step-label">ARIA Chat</p>
              <h1>{activeConversation?.title || 'New conversation'}</h1>
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => navigate(ROUTES.SETTINGS, { state: { tab: 'notifications' } })}
            >
              <SettingsLogo type="notifications" size="sm" />
              Notifications
            </button>
            <button type="button" className="ghost-button" onClick={handleLogout}>
              <SettingsLogo type="logout" size="sm" />
              Logout
            </button>
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
              <p className="step-label">Welcome to AIRA</p>
              <h2>Where silence finds its voice</h2>
              <h2>Start a conversation</h2>
              <p className="muted">Create a new chat to begin using ARIA.</p>
              <button type="button" className="btn btn-primary" onClick={handleNewChat}>
                New Chat
              </button>
            </div>
          </div>
        )}
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}

export default ChatPage
