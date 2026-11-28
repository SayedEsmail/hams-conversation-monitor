import { useMutation } from '@tanstack/react-query'
import { takeOver } from '../api/client'
import type { Conversation } from '../api/types'
import { useText } from '../i18n'
import { useAppStore, useStatus } from '../store/appStore'

export function TakeOverButton({ conversation }: { conversation: Conversation }) {
  const status = useStatus(conversation)
  const stopped = useAppStore((state) => Boolean(state.stopped[conversation.id]))
  const toggleStopped = useAppStore((state) => state.toggleStopped)
  const t = useText()

  // useMutation is the counterpart of useQuery for requests that change
  // something: it runs only when `mutate` is called, and tracks pending and
  // error for us. The new status is not read from the response: the server
  // announces it on the stream, and that event is what disables this button.
  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => takeOver(conversation.id),
    // Taking over a stopped conversation starts it again: the thread follows
    // the stream and the reply box comes back.
    onSuccess: () => {
      if (stopped) toggleStopped(conversation.id)
    },
  })

  // Stopping a conversation gives it back, so the user can take it over again.
  const canTakeOver = status === 'needs_human' || (status === 'human' && stopped)

  return (
    <>
      {isError && (
        <span role="alert" className="text-xs text-red-600">
          {t.takeOverFailed}
        </span>
      )}
      <button
        type="button"
        disabled={!canTakeOver || isPending}
        onClick={() => mutate()}
        className="shrink-0 rounded-lg bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800 disabled:bg-slate-200 disabled:text-slate-500"
      >
        {isPending ? t.takingOver : t.takeOver}
      </button>
    </>
  )
}
