import { useMutation } from '@tanstack/react-query'
import { takeOver } from '../api/client'
import type { Conversation } from '../api/types'
import { useText } from '../i18n'
import { useStatus } from '../store/appStore'

export function TakeOverButton({ conversation }: { conversation: Conversation }) {
  const status = useStatus(conversation)
  const t = useText()

  // useMutation is the counterpart of useQuery for requests that change
  // something: it runs only when `mutate` is called, and tracks pending and
  // error for us. There is no success handler: the server announces the new
  // status on the stream, and that event is what disables this button again.
  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => takeOver(conversation.id),
  })

  return (
    <>
      {isError && (
        <span role="alert" className="text-xs text-red-600">
          {t.takeOverFailed}
        </span>
      )}
      <button
        type="button"
        disabled={status !== 'needs_human' || isPending}
        onClick={() => mutate()}
        className="shrink-0 rounded-lg bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800 disabled:bg-slate-200 disabled:text-slate-500"
      >
        {isPending ? t.takingOver : t.takeOver}
      </button>
    </>
  )
}
