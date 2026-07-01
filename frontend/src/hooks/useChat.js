import { useCallback, useMemo, useState } from 'react'
import { ChatService } from '../services/chat.service'

const createMessage = ({ content, role = 'user', metadata = {} }) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  role,
  content,
  metadata,
  createdAt: new Date().toISOString(),
})

export const useChat = ({ initialMessages = [] } = {}) => {
  const [messages, setMessages] = useState(initialMessages)
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const addMessage = useCallback(
    (message) => {
      const nextMessage =
        typeof message === 'string' ? createMessage({ content: message }) : createMessage(message)

      setMessages((currentMessages) => [...currentMessages, nextMessage])
      return nextMessage
    },
    [setMessages],
  )

  const addUserMessage = useCallback(
    (content, metadata) => addMessage({ role: 'user', content, metadata }),
    [addMessage],
  )

  const addAssistantMessage = useCallback(
    (content, metadata) => addMessage({ role: 'assistant', content, metadata }),
    [addMessage],
  )

  const removeMessage = useCallback(
    (id) => {
      setMessages((currentMessages) => currentMessages.filter((message) => message.id !== id))
    },
    [setMessages],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [setMessages])

  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await ChatService.getConversations()
      setConversations(data)
      if (!currentConversation && data.length > 0) {
        setCurrentConversation(data[0])
      }
      return data
    } catch (err) {
      setError(err.message || 'Unable to load conversations')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentConversation, setConversations])

  const createConversation = useCallback(
    async (data) => {
      setIsLoading(true)
      setError(null)

      try {
        const conversation = await ChatService.createConversation(data)
        setConversations((current) => [conversation, ...current])
        setCurrentConversation(conversation)
        return conversation
      } catch (err) {
        setError(err.message || 'Unable to create conversation')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setConversations],
  )

  const selectConversation = useCallback(
    (id) => {
      const conversation = conversations.find((item) => item.id === id) || null
      setCurrentConversation(conversation)
      return conversation
    },
    [conversations],
  )

  const deleteConversation = useCallback(
    async (id) => {
      await ChatService.deleteConversation(id)
      setConversations((current) => current.filter((conversation) => conversation.id !== id))
      setCurrentConversation((current) => (current?.id === id ? null : current))
    },
    [setConversations],
  )

  const sendMessage = useCallback(
    async (content, sendHandler) => {
      if (!content?.trim()) return null

      setIsLoading(true)
      setError(null)

      const userMessage = addUserMessage(content.trim())

      try {
        if (sendHandler) {
          const response = await sendHandler(userMessage, messages)

          if (response) {
            return typeof response === 'string'
              ? addAssistantMessage(response)
              : addMessage({ role: 'assistant', ...response })
          }
        }

        return userMessage
      } catch (err) {
        setError(err.message || 'Unable to send message')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [addAssistantMessage, addMessage, addUserMessage, messages],
  )

  const lastMessage = messages[messages.length - 1] ?? null

  const groupedMessages = useMemo(
    () => ({
      user: messages.filter((message) => message.role === 'user'),
      assistant: messages.filter((message) => message.role === 'assistant'),
      system: messages.filter((message) => message.role === 'system'),
    }),
    [messages],
  )

  return {
    messages,
    lastMessage,
    groupedMessages,
    isLoading,
    error,
    setMessages,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    removeMessage,
    clearMessages,
    sendMessage,
    conversations,
    currentConversation,
    setCurrentConversation,
    loadConversations,
    createConversation,
    selectConversation,
    deleteConversation,
  }
}

export default useChat
