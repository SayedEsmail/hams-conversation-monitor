import type { Conversation } from '../api/types'
import { useAppStore } from '../store/appStore'
import { StatusBadge } from './StatusBadge'

interface ConversationListItemProps {
  conversation: Conversation
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
  const { id, customer, status, lastMessage, unread } = conversation

  // The selector returns a boolean, so selecting another conversation re-renders
  // only the two items whose answer changed, not the whole list.
  const isSelected = useAppStore((state) => state.selectedConversationId === id)
  const selectConversation = useAppStore((state) => state.selectConversation)

  return (
    <li>
      <button
        type="button"
        aria-current={isSelected}
        onClick={() => selectConversation(id)}
        className={`flex w-full flex-col gap-1 px-4 py-3 text-start hover:bg-slate-50 ${
          isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* dir="auto": the browser picks the direction from the text itself, so an
              Arabic message reads correctly and is cut at its end, not its start,
              whatever the page direction is. */}
          <span dir="auto" className="truncate font-medium">
            {customer}
          </span>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span dir="auto" className="truncate text-sm text-slate-500">
            {lastMessage}
          </span>
          {unread > 0 && (
            <span
              className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white"
              aria-label={`${unread} unread messages`}
            >
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </button>
    </li>
  )
}
