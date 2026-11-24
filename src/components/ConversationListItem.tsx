import type { Conversation } from '../api/types'
import { useText } from '../i18n'
import { useAppStore } from '../store/appStore'
import { Avatar } from './Avatar'
import { StatusBadge } from './StatusBadge'

export function ConversationListItem({ conversation }: { conversation: Conversation }) {
  const { id, customer } = conversation

  // The selector returns a boolean, so selecting another conversation re-renders
  // only the two items whose answer changed, not the whole list.
  const isSelected = useAppStore((state) => state.selectedConversationId === id)
  const selectConversation = useAppStore((state) => state.selectConversation)
  // Only this conversation's entries, so an event elsewhere does not re-render this item.
  const live = useAppStore((state) => state.live.messages[id]) ?? []
  const seen = useAppStore((state) => state.seen[id])
  const t = useText()

  // The newest real message. A reply whose start we missed has only part of its text.
  const lastLive = live.findLast((entry) => entry.role !== 'handoff' && !entry.partial)
  const lastMessage = lastLive?.text ?? conversation.lastMessage

  // The server's count is from before the page loaded and stands until the
  // conversation is first opened. After that we count the customer messages
  // that arrived since the user last looked.
  const newFromCustomer = live.slice(seen).filter((entry) => entry.role === 'customer').length
  const unread = isSelected ? 0 : (seen === undefined ? conversation.unread : 0) + newFromCustomer

  return (
    <li>
      <button
        type="button"
        aria-current={isSelected}
        onClick={() => selectConversation(id)}
        // border-s-2: a bar on the start side marks the selected conversation. It
        // is always there (transparent), so selecting does not shift the content.
        className={`flex w-full items-center gap-3 border-s-2 px-4 py-3 text-start focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 ${isSelected ? 'border-blue-600 bg-slate-100' : 'border-transparent hover:bg-slate-50'}`}
      >
        <Avatar name={customer} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            {/* dir="auto": the browser picks the direction from the text itself, so an
                Arabic message reads correctly and is cut at its end, not its start,
                whatever the page direction is. */}
            <span dir="auto" className="truncate font-semibold">
              {customer}
            </span>
            <StatusBadge conversation={conversation} />
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            {live.at(-1)?.streaming ? (
              <span className="truncate text-sm text-emerald-700 italic">{t.typing}</span>
            ) : (
              <span dir="auto" className="truncate text-sm text-slate-500">
                {lastMessage}
              </span>
            )}
            {unread > 0 && (
              <span
                className="shrink-0 rounded-full bg-blue-600 px-1.5 text-xs leading-5 font-semibold text-white"
                aria-label={t.unread(unread)}
              >
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  )
}
