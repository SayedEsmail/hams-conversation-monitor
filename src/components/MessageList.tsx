import { useLayoutEffect, useRef } from 'react'
import { useMessages } from '../api/queries'
import { LoadError } from './LoadError'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  conversationId: string
}

export function MessageList({ conversationId }: MessageListProps) {
  const { data, isPending, isError, error, refetch } = useMessages(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)

  // A chat opens at its newest message. useLayoutEffect runs after React has
  // updated the DOM but before the browser paints, so the user never sees the
  // list at the top first.
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [data])

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
      {data.messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
