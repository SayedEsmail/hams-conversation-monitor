import { useMutation } from '@tanstack/react-query'
import { takeOver } from '../api/client'
import type { Conversation } from '../api/types'
import { useStatus } from '../store/appStore'

export function TakeOverButton({ conversation }: { conversation: Conversation }) {
  const status = useStatus(conversation)

  // useMutation is the counterpart of useQuery for requests that change
  // something: it runs only when `mutate` is called, and tracks pending and
  // error for us. There is no success handler: the server announces the new
  // status on the stream, and that event is what hides this button.
  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => takeOver(conversation.id),
  })

  if (status !== 'needs_human') return null

  return (
    <>
      {isError && (
        <span role="alert" className="text-xs text-red-600">
          Could not take over
        </span>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => mutate()}
        className="shrink-0 rounded bg-amber-500 px-3 py-1 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
      >
        {isPending ? 'Taking over…' : 'Take over'}
      </button>
    </>
  )
}
