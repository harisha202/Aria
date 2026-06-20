/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react'
import { useChat } from '../hooks/useChat'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const chat = useChat()
  const value = useMemo(() => chat, [chat])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used inside ChatProvider')
  }
  return context
}

export default ChatContext
