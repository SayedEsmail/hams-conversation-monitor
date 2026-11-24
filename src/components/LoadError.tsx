import { useText } from '../i18n'

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useText()

  return (
    <div className="flex flex-col items-start gap-2 p-4 text-sm">
      <p className="text-red-600">{message}</p>
      <button
        type="button"
        className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100"
        onClick={onRetry}
      >
        {t.retry}
      </button>
    </div>
  )
}
