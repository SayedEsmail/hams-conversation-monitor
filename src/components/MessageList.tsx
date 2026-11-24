import { useLayoutEffect, useMemo, useRef } from 'react'
import { useMessages } from '../api/queries'
import { useAppStore } from '../store/appStore'
import { mergeThread } from '../stream/mergeThread'
import { LoadError } from './LoadError'
import { MessageBubble } from './MessageBubble'

export function MessageList({ conversationId }: { conversationId: string }) {
  const { data, isPending, isError, error, refetch } = useMessages(conversationId)
  const live = useAppStore((state) => state.live.messages[conversationId])
  const bottomRef = useRef<HTMLDivElement>(null)

  // useMemo keeps the merged list between renders and rebuilds it only when the
  // snapshot or this conversation's live entries change.
  const thread = useMemo(() => (data ? mergeThread(data, live ?? []) : []), [data, live])

  // Keeps the newest message in view. useLayoutEffect runs after React has
  // updated the DOM but before the browser paints, so the user never sees the
  // list at the top first.
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [thread])

  if (isPending) {
    return <p className="m-auto text-sm text-slate-500">Loading messages…</p>
  }

  if (isError) {
    return (
      <LoadError message={`Could not load messages: ${error.message}`} onRetry={() => refetch()} />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
      {thread.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
