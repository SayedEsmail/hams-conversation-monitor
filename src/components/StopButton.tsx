import { useText } from '../i18n'
import { useAppStore } from '../store/appStore'

export function StopButton({ conversationId }: { conversationId: string }) {
  const stopped = useAppStore((state) => Boolean(state.stopped[conversationId]))
  const toggleStopped = useAppStore((state) => state.toggleStopped)
  const t = useText()

  return (
    <button
      type="button"
      aria-pressed={stopped}
      onClick={() => toggleStopped(conversationId)}
      className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
    >
      {stopped ? t.resume : t.stop}
    </button>
  )
}
