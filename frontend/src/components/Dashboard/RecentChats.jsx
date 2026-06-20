import { formatDatetime, truncateText } from '../../utils/formatters'

function RecentChats({ chats = [], onSelectChat }) {
  return (
    <div className="recent-chat-list">
      {chats.map((chat) => (
        <button
          className="recent-chat-item"
          type="button"
          key={chat.id}
          onClick={() => onSelectChat?.(chat.id)}
        >
          <span>
            <strong>{chat.title || 'Untitled chat'}</strong>
            <br />
            <small className="muted">{truncateText(chat.last_message || 'No messages yet', 70)}</small>
          </span>
          <small className="muted">{formatDatetime(chat.updated_at || chat.created_at)}</small>
        </button>
      ))}
    </div>
  )
}

export default RecentChats
