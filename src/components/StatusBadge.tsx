import type { Status } from '../api/types'

// Full class names on purpose: Tailwind finds classes by scanning the source
// as text, so a name built at runtime (`bg-${color}-100`) would not be generated.
const STATUS: Record<Status, { label: string; className: string }> = {
  ai: { label: 'AI handling', className: 'bg-sky-100 text-sky-800' },
  needs_human: { label: 'Needs human', className: 'bg-amber-100 text-amber-800' },
  human: { label: 'Human handling', className: 'bg-emerald-100 text-emerald-800' },
  closed: { label: 'Closed', className: 'bg-slate-200 text-slate-600' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS[status]

  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
