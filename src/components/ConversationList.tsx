import { useConversations } from '../api/queries'
import { ConversationListItem } from './ConversationListItem'

export function ConversationList() {
  const { data, isPending, isError, error, refetch } = useConversations()

  if (isPending) {
    return <p className="p-4 text-sm text-slate-500">Loading conversations…</p>
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-2 p-4 text-sm">
        <p className="text-red-600">Could not load conversations: {error.message}</p>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-slate-100">
      {data.conversations.map((conversation) => (
        <ConversationListItem key={conversation.id} conversation={conversation} />
      ))}
    </ul>
  )
}
