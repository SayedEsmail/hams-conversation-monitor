import { useConversations } from '../api/queries'
import { useAppStore } from '../store/appStore'
import { MessageList } from './MessageList'
import { StatusBadge } from './StatusBadge'

export function ConversationThread() {
  const selectedConversationId = useAppStore((state) => state.selectedConversationId)
  const { data } = useConversations()
  const conversation = data?.conversations.find((c) => c.id === selectedConversationId)

  if (!conversation) {
    return <p className="m-auto text-sm text-slate-500">Select a conversation</p>
  }

  return (
    <>
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <h2 dir="auto" className="truncate font-semibold">
          {conversation.customer}
        </h2>
        <StatusBadge status={conversation.status} />
      </header>

      <MessageList conversationId={conversation.id} />
    </>
  )
}
