import { useConversations } from '../api/queries'
import { useText } from '../i18n'
import { useAppStore } from '../store/appStore'
import { MessageList } from './MessageList'
import { ReplyBox } from './ReplyBox'
import { StatusBadge } from './StatusBadge'
import { TakeOverButton } from './TakeOverButton'

export function ConversationThread() {
  const selectedConversationId = useAppStore((state) => state.selectedConversationId)
  const { data } = useConversations()
  const t = useText()
  const conversation = data?.conversations.find((c) => c.id === selectedConversationId)

  if (!conversation) {
    return <p className="m-auto text-sm text-slate-500">{t.selectConversation}</p>
  }

  return (
    <>
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <h2 dir="auto" className="truncate font-semibold">
          {conversation.customer}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {/* key: another conversation gets a new button, so a pending or failed
              request of the previous one does not carry over. */}
          <TakeOverButton key={conversation.id} conversation={conversation} />
          <StatusBadge conversation={conversation} />
        </div>
      </header>

      <MessageList conversationId={conversation.id} />
      {/* key: the draft and the error belong to one conversation. */}
      <ReplyBox key={conversation.id} conversation={conversation} />
    </>
  )
}
