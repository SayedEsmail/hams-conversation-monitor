import { useConversations } from '../api/queries'
import { ConversationListItem } from './ConversationListItem'
import { LoadError } from './LoadError'

export function ConversationList() {
  const { data, isPending, isError, error, refetch } = useConversations()

  if (isPending) {
    return (
      <p className="p-4 text-sm text-slate-500">
        <bdi>Loading conversations…</bdi>
      </p>
    )
  }

  if (isError) {
    return (
      <LoadError
        message={`Could not load conversations: ${error.message}`}
        onRetry={() => refetch()}
      />
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
