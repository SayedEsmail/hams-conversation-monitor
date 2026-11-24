import { memo } from 'react'
import type { Role } from '../api/types'
import { useText } from '../i18n'
import type { ThreadEntry } from '../stream/applyEvent'

// self-start / self-end follow the page direction, so the customer's side and
// the agent's side swap automatically in RTL.
const SIDE: Record<Role, string> = {
  customer: 'self-start border-slate-200 bg-white',
  ai: 'self-end border-sky-100 bg-sky-50',
  human: 'self-end border-emerald-100 bg-emerald-50',
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
      <p className="self-center rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">
        {/* bdi: the reason can be in another language than the interface. It
            keeps its own direction and does not reorder the text around it. */}
        {t.handedOver} <bdi>{message.text}</bdi>
      </p>
    )
  }

  const state = pending ? t.sending : message.streaming ? t.typing : null

  return (
    <div
      className={`max-w-[75%] rounded-lg border px-3 py-2 ${SIDE[message.role]} ${pending ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
        <span className="font-medium">{t.role[message.role]}</span>
        {state ?? (
          <time dateTime={message.createdAt}>{t.time.format(new Date(message.createdAt))}</time>
        )}
      </div>
      <p dir="auto" className="mt-1 text-sm break-words whitespace-pre-wrap">
        {message.text}
        {message.streaming && <span className="motion-safe:animate-pulse"> ▍</span>}
      </p>
    </div>
  )
})
