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
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.SETTINGS, { state: { tab: 'notifications' } })}
          >
            <SettingsLogo type="notifications" size="sm" />
            Notifications
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
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.SETTINGS, { state: { tab: 'notifications' } })}
            >
              <SettingsLogo type="notifications" size="sm" />
              Notifications
            </Button>
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
