import { useAppStore } from '../store/appStore'

const CONNECTION = {
  connecting: { label: 'Connecting…', className: 'bg-slate-400' },
  connected: { label: 'Live', className: 'bg-emerald-500' },
  reconnecting: { label: 'Reconnecting…', className: 'bg-amber-500' },
}

export function ConnectionBadge() {
  const { label, className } = CONNECTION[useAppStore((state) => state.connection)]

  return (
    // role="status": a screen reader announces the text when it changes.
    <span role="status" className="flex items-center gap-2 text-sm text-slate-600">
      <span className={`size-2 rounded-full ${className}`} />
      {/* bdi: the label is English, so it keeps its own direction. Without it
          the "…" would jump to the other end of the word in RTL. */}
      <bdi>{label}</bdi>
    </span>
  )
}
