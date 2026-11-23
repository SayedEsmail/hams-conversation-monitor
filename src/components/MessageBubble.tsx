import type { Message, Role } from '../api/types'

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

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { label, className } = ROLE[message.role]

  return (
    <div className={`max-w-[75%] rounded-lg border px-3 py-2 ${className}`}>
      <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
        <span className="font-medium">{label}</span>
        <time dateTime={message.createdAt}>{timeFormat.format(new Date(message.createdAt))}</time>
      </div>
      <p dir="auto" className="mt-1 text-sm break-words whitespace-pre-wrap">
        {message.text}
      </p>
    </div>
  )
}
