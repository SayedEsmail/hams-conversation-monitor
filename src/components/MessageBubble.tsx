import { memo } from 'react'
import type { Role } from '../api/types'
import type { ThreadEntry } from '../stream/applyEvent'

// self-start / self-end follow the page direction, so the customer's side and
// the agent's side swap automatically in RTL.
const ROLE: Record<Role, { label: string; className: string }> = {
  customer: { label: 'Customer', className: 'self-start border-slate-200 bg-white' },
  ai: { label: 'AI', className: 'self-end border-sky-100 bg-sky-50' },
  human: { label: 'Human', className: 'self-end border-emerald-100 bg-emerald-50' },
}

// Created once and reused: building a formatter per message would be wasteful
// in a conversation with thousands of messages.
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })

// memo: React skips this component when its props are the same as last time.
// The reducer and the merge keep an unchanged message as the same object, so a
// new token re-renders only the bubble it belongs to.
export const MessageBubble = memo(function MessageBubble({
  message,
  pending,
}: {
  message: ThreadEntry
  pending?: boolean
}) {
  if (message.role === 'handoff') {
    return (
      <p
        dir="ltr"
        className="self-center rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800"
      >
        Handed over to a human: <bdi>{message.text}</bdi>
      </p>
    )
  }

  const { label, className } = ROLE[message.role]
  const state = pending ? 'Sending…' : message.streaming ? 'Typing…' : null

  return (
    <div
      className={`max-w-[75%] rounded-lg border px-3 py-2 ${className} ${pending ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
        <span className="font-medium">{label}</span>
        {state ? (
          <bdi>{state}</bdi>
        ) : (
          // dir="auto": in RTL "08:48 AM" would otherwise be shown as "AM 08:48".
          <time dir="auto" dateTime={message.createdAt}>
            {timeFormat.format(new Date(message.createdAt))}
          </time>
        )}
      </div>
      <p dir="auto" className="mt-1 text-sm break-words whitespace-pre-wrap">
        {message.text}
        {message.streaming && <span className="motion-safe:animate-pulse"> ▍</span>}
      </p>
    </div>
  )
})
