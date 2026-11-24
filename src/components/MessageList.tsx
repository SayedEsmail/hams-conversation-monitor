import { useMemo } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useMessages } from '../api/queries'
import { useText } from '../i18n'
import { useAppStore } from '../store/appStore'
import { mergeThread } from '../stream/mergeThread'
import { LoadError } from './LoadError'
import { MessageBubble } from './MessageBubble'

export function MessageList({ conversationId }: { conversationId: string }) {
  const { data, isPending, isError, error, refetch } = useMessages(conversationId)
  const live = useAppStore((state) => state.live.messages[conversationId])
  const pending = useAppStore((state) => state.live.pending)
  const t = useText()

  // useMemo keeps the merged list between renders and rebuilds it only when the
  // snapshot or this conversation's live entries change.
  const thread = useMemo(() => (data ? mergeThread(data, live ?? []) : []), [data, live])
  // Replies the server has not confirmed yet go last.
  const rows = useMemo(
    () => [...thread, ...pending.filter((reply) => reply.conversationId === conversationId)],
    [thread, pending, conversationId],
  )

  if (isPending) {
    return <p className="m-auto text-sm text-slate-500">{t.loadingMessages}</p>
  }

  if (isError) {
    return (
      <LoadError
        message={`${t.loadMessagesFailed} ${error.message}`}
        onRetry={() => refetch()}
      />
    )
  }

  // A virtual list: only the rows near the visible area exist in the DOM, however
  // long the conversation is.
  return (
    <Virtuoso
      // A new list per conversation, so each one opens at its newest message.
      key={conversationId}
      className="min-h-0 flex-1"
      data={rows}
      computeItemKey={(_, row) => row.id}
      initialTopMostItemIndex={{ index: 'LAST', align: 'end' }}
      // Stay with the newest message, but only while the user is at the bottom,
      // or within about one message of it.
      followOutput="auto"
      atBottomThreshold={100}
      itemContent={(index, row) => (
        <div className="flex flex-col px-4 py-1">
          <MessageBubble message={row} pending={index >= thread.length} />
        </div>
      )}
    />
  )
}
