import { useText } from '../i18n'
import { useAppStore } from '../store/appStore'

const DOT = {
  connecting: 'bg-slate-400',
  connected: 'bg-emerald-500',
  reconnecting: 'bg-amber-500',
}

export function ConnectionBadge() {
  const connection = useAppStore((state) => state.connection)
  const t = useText()

  return (
    // role="status": a screen reader announces the text when it changes.
    <span role="status" className="flex items-center gap-2 text-sm text-slate-600">
      <span className={`size-2 rounded-full ${DOT[connection]}`} />
      {t.connection[connection]}
    </span>
  )
}
