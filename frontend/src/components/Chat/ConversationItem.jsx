import { formatDatetime, truncateText } from '../../utils/formatters'

function ConversationItem({ conversation, active = false, onSelect, onDelete }) {
  return (
    <article className={`conversation-item ${active ? 'active' : ''}`}>
      <button type="button" className="sidebar-link" onClick={() => onSelect?.(conversation.id)}>
        <strong className="conversation-title">{conversation.title || 'Untitled chat'}</strong>
        <span className="muted">{truncateText(conversation.last_message || 'No messages yet', 54)}</span>
        <small className="muted">{formatDatetime(conversation.updated_at || conversation.created_at)}</small>
      </button>
      {onDelete && (
        <button type="button" className="icon-button" onClick={() => onDelete(conversation.id)} aria-label="Delete conversation">
          Del
        </button>
      )}
    </article>
  )
}

export default ConversationItem
