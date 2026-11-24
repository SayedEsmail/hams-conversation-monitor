import { useMemo, type KeyboardEvent } from 'react'
import { useConversations } from '../api/queries'
import { useText } from '../i18n'
import { useAppStore } from '../store/appStore'
import { ConversationListItem } from './ConversationListItem'
import { LoadError } from './LoadError'

// Arrow keys move the focus through the list. Every item is a real button, so
// Enter or Space then opens the focused conversation.
function moveFocus(event: KeyboardEvent<HTMLUListElement>) {
  const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  if (!step) return
  event.preventDefault()
  const buttons = [...event.currentTarget.querySelectorAll('button')]
  buttons[buttons.indexOf(document.activeElement as HTMLButtonElement) + step]?.focus()
}

export function ConversationList() {
  const { data, isPending, isError, error, refetch } = useConversations()
  const handoffAt = useAppStore((state) => state.live.handoffAt)
  const t = useText()

  // A conversation moves to the top when it is handed over to a human, the most
  // recent hand-off first. The sort is stable, so all the others keep the order
  // they were loaded in and the list does not jump on every message.
  const conversations = useMemo(
    () =>
      (data?.conversations ?? []).toSorted(
        (a, b) => (handoffAt[b.id] ?? 0) - (handoffAt[a.id] ?? 0),
      ),
    [data, handoffAt],
  )

  if (isPending) {
    return <p className="p-4 text-sm text-slate-500">{t.loadingConversations}</p>
  }

  if (isError) {
    return (
      <LoadError
        message={`${t.loadConversationsFailed} ${error.message}`}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <ul onKeyDown={moveFocus} className="divide-y divide-slate-100">
      {conversations.map((conversation) => (
        <ConversationListItem key={conversation.id} conversation={conversation} />
      ))}
    </ul>
  )
}
