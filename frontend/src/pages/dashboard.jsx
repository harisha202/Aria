import { useMemo, useState, useEffect } from 'react'
import AiraLogo from '../components/AiraLogo'
import PixelSnow from '../components/Backgrounds/PixelSnow'
import Navbar from '../components/Common/Navbar'
import Toast from '../components/Common/Toast'
import StatCard from '../components/Dashboard/StatCard'
import RecentChats from '../components/Dashboard/RecentChats'
import UsageChart from '../components/Dashboard/UsageChart'
import QuickActions from '../components/Dashboard/QuickActions'
import { useAuthContext } from '../context/AuthContext'
import { useChatContext } from '../context/ChatContext'
import { ROUTES } from '../utils/constants'
import { ChatService } from '../services/chat.service'
import Button from '../components/Common/Button'

function DashboardPage({ navigate }) {
  const { user } = useAuthContext()
  const { conversations, createConversation, selectConversation, loadConversations } = useChatContext()
  const [toast, setToast] = useState(null)

  const stats = useMemo(() => {
    const totalMessages = conversations.reduce(
      (sum, conversation) => sum + (conversation.message_count || 0),
      0,
    )
    const now = new Date()
    const thisMonth = conversations.filter((conversation) => {
      const created = new Date(conversation.created_at)
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length

    return {
      totalConversations: conversations.length,
      totalMessages,
      thisMonth,
    }
  }, [conversations])

  const [chartData, setChartData] = useState([])
  const [primaryColor] = useState(() => {
    if (typeof window !== 'undefined') {
      const rootStyle = getComputedStyle(document.documentElement)
      const pc = rootStyle.getPropertyValue('--primary').trim()
      return pc || '#06B6D4'
    }
    return '#06B6D4'
  })
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await ChatService.getWeeklyStats()
        setChartData(stats)
      } catch (err) {
        console.error('Failed to fetch weekly stats', err)
      }
    }
    fetchStats()

    // Ensure conversations are loaded so stats compute correctly
    loadConversations().catch(() => {})
  }, [loadConversations])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  const handleNewChat = async () => {
    const conversation = await createConversation()
    selectConversation(conversation.id)
    showToast('New conversation created', 'success')
    navigate(ROUTES.CHAT)
  }

  const handleLogout = () => {
    navigate(ROUTES.LOGOUT)
  }

  return (
    <main className="app-shell snow-page">
      <div className="page-pixel-snow-bg">
        <PixelSnow
          color={primaryColor}
          flakeSize={0.022}
          minFlakeSize={1.25}
          pixelResolution={230}
          speed={2.1}
          density={0.45}
          direction={175}
          brightness={1.4}
          depthFade={8}
          farPlane={25}
          gamma={0.4545}
          variant="square"
        />
      </div>
      <Navbar navigate={navigate} user={user} onLogout={handleLogout} />

      <div className="app-content">
        <header className="dashboard-header page-title-with-logo">
          <div className="page-logo-frame">
            <AiraLogo className="page-logo-canvas" width={400} height={380} />
          </div>
          <div>
            <p className="step-label">Dashboard</p>
            <h1>Welcome back, {user?.name || user?.full_name || 'Guest'}</h1>
            <p className="muted">Your ARIA conversations, usage, and next actions are ready.</p>
          </div>
        </header>

        <section className="stat-grid" aria-label="Usage statistics">
          <StatCard title="Total Conversations" value={stats.totalConversations} trend="Ready for Week 2" />
          <StatCard title="Total Messages" value={stats.totalMessages} trend="Saved locally" />
          <StatCard title="This Month" value={stats.thisMonth} trend="Current activity" />
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <h2>Weekly Activity</h2>
            <UsageChart data={chartData} />
          </div>

          <div className="panel">
            <h2>Quick Actions</h2>
            <QuickActions
              onNewChat={handleNewChat}
              onChat={() => navigate(ROUTES.CHAT)}
            />
          </div>
        </section>

        <section className="panel">
          <div className="recent-chat-item">
            <h2>Recent Conversations</h2>
            <Button variant="ghost" onClick={() => navigate(ROUTES.CHAT)}>
              View all
            </Button>
          </div>
          {conversations.length > 0 ? (
            <RecentChats
              chats={conversations.slice(0, 6)}
              onSelectChat={(id) => {
                selectConversation(id)
                navigate(ROUTES.CHAT)
              }}
            />
          ) : (
            <p className="muted">No conversations yet. Start one from Quick Actions.</p>
          )}
        </section>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}

export default DashboardPage
