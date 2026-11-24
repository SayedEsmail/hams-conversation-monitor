import type { Conversation, Status } from '../api/types'
import { useText } from '../i18n'
import { useStatus } from '../store/appStore'

// Full class names on purpose: Tailwind finds classes by scanning the source
// as text, so a name built at runtime (`bg-${color}-100`) would not be generated.
const COLOR: Record<Status, string> = {
  ai: 'bg-sky-100 text-sky-800',
  needs_human: 'bg-amber-100 text-amber-800',
  human: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-200 text-slate-600',
}

export function StatusBadge({ conversation }: { conversation: Conversation }) {
  const status = useStatus(conversation)
  const t = useText()

  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${COLOR[status]}`}>
      {t.status[status]}
    </span>
  )
}
