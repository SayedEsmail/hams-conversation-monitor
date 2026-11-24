import { memo } from 'react'
import type { Role } from '../api/types'
import { useText } from '../i18n'
import type { ThreadEntry } from '../stream/applyEvent'

// The side uses start and end, so the customer's side and the agent's side swap
// automatically in RTL. The corner next to the sender is less round, and
// `rounded-es` / `rounded-ee` (end-start, end-end) flip with the direction too.
const LOOK: Record<Role, { side: string; bubble: string; name: string }> = {
  customer: {
    side: 'self-start items-start',
    bubble: 'rounded-es-sm bg-white',
    name: 'text-amber-700',
  },
  ai: {
    side: 'self-end items-end',
    bubble: 'rounded-ee-sm bg-violet-100',
    name: 'text-violet-800',
  },
  human: {
    side: 'self-end items-end',
    bubble: 'rounded-ee-sm bg-blue-600 text-white',
    name: 'text-blue-100',
  },
}

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
  const t = useText()

  if (message.role === 'handoff') {
    return (
      <p className="self-center rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
        {/* bdi: the reason can be in another language than the interface. It
            keeps its own direction and does not reorder the text around it. */}
        {t.handedOver} <bdi>{message.text}</bdi>
      </p>
    )
  }

  const { side, bubble, name } = LOOK[message.role]

  return (
    <div className={`flex max-w-[70%] flex-col gap-1 ${side} ${pending ? 'opacity-60' : ''}`}>
      <div className={`rounded-2xl px-4 py-2.5 ${bubble}`}>
        <span className={`text-xs font-semibold ${name}`}>{t.role[message.role]}</span>
        <p dir="auto" className="text-sm break-words whitespace-pre-wrap">
          {message.text}
          {message.streaming && <span className="motion-safe:animate-pulse"> ▍</span>}
        </p>
      </div>
      <span className="px-1 text-xs text-slate-500">
        {pending ? (
          t.sending
        ) : (
          <time dateTime={message.createdAt}>{t.time.format(new Date(message.createdAt))}</time>
        )}
      </span>
    </div>
  )
})
