export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-2 p-4 text-sm">
      <p className="text-red-600">{message}</p>
      <button
        type="button"
        className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  )
}
