import ConversationItem from './ConversationItem'

function ConversationList({ conversations = [], currentId, onSelect, onDelete }) {
  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          active={conversation.id === currentId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default ConversationList
