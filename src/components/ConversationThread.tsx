import { useConversations } from '../api/queries'
import type { Conversation } from '../api/types'
import { useText } from '../i18n'
import { useAppStore, useStatus } from '../store/appStore'
import { Avatar } from './Avatar'
import { MessageList } from './MessageList'
import { ReplyBox } from './ReplyBox'
import { TakeOverButton } from './TakeOverButton'

// The line under the name: the status, or "AI is typing…" while a reply streams.
// It is its own component, so a token re-renders this line and not the header.
function Subtitle({ conversation }: { conversation: Conversation }) {
  const status = useStatus(conversation)
  const typing = useAppStore((state) => state.live.messages[conversation.id]?.at(-1)?.streaming)
  const t = useText()

  return typing ? (
    <p className="text-sm text-emerald-700 italic">{t.typing}</p>
  ) : (
    <p className="text-sm text-slate-500">{t.status[status]}</p>
  )
}

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
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <Avatar name={conversation.customer} />
        <div className="min-w-0 flex-1">
          {/* w-fit: the name keeps its own direction (dir="auto") but still sits
              next to the avatar, also when the page direction is the other one. */}
          <h2 dir="auto" className="w-fit max-w-full truncate font-semibold">
            {conversation.customer}
          </h2>
          <Subtitle conversation={conversation} />
        </div>
        {/* key: another conversation gets a new button, so a pending or failed
            request of the previous one does not carry over. */}
        <TakeOverButton key={conversation.id} conversation={conversation} />
      </header>

      <MessageList conversationId={conversation.id} />
      {/* key: the draft and the error belong to one conversation. */}
      <ReplyBox key={conversation.id} conversation={conversation} />
    </>
  )
}
