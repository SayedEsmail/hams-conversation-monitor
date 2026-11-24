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
  const activity = useAppStore((state) => state.live.activity)
  const t = useText()

  // Newest first, like the server sends it. Conversations with live activity
  // come first, most recent on top. The sort is stable, so the others keep the
  // order they were loaded in.
  const conversations = useMemo(
    () =>
      (data?.conversations ?? []).toSorted(
        (a, b) => (activity[b.id] ?? 0) - (activity[a.id] ?? 0),
      ),
    [data, activity],
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
