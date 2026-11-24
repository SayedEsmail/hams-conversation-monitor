import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { sendMessage } from '../api/client'
import type { Conversation } from '../api/types'
import { useText } from '../i18n'
import { useAppStore, useStatus } from '../store/appStore'
import type { LiveMessage } from '../stream/applyEvent'

export function ReplyBox({ conversation }: { conversation: Conversation }) {
  const status = useStatus(conversation)
  const addPending = useAppStore((state) => state.addPending)
  const removePending = useAppStore((state) => state.removePending)
  const [text, setText] = useState('')
  const t = useText()

  const { mutate, error } = useMutation({
    mutationFn: (reply: LiveMessage) => sendMessage(conversation.id, reply.text, reply.id),
    // Optimistic: show the reply before the server answers.
    onMutate: (reply) => {
      addPending(reply)
      setText('')
    },
    // Rejected: take the reply out of the thread and give the text back, unless
    // the user has already started typing something else.
    onError: (_error, reply) => {
      removePending(reply.id)
      setText((current) => current || reply.text)
    },
    // No onSuccess: the stream delivers the saved message, and the reducer
    // swaps it for the optimistic copy.
  })

  if (status !== 'human') return null

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    mutate({
      // Sent as clientMessageId, so we can recognise this reply when it comes back.
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      role: 'human',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      tokens: [],
    })
  }

  return (
    <form onSubmit={submit} className="border-t border-slate-200 bg-white px-5 py-3">
      {error && (
        <p role="alert" className="mx-auto mb-2 max-w-6xl text-xs text-red-600">
          {t.notSent} {error.message}
        </p>
      )}
      <div className="mx-auto flex max-w-6xl gap-2">
        <input
          // Focus lands here after a take over, when the button the user just
          // clicked disappears.
          autoFocus
          // With text: the direction follows what the user types. Empty: it
          // follows the page, so the placeholder starts on the correct side.
          dir={text ? 'auto' : undefined}
          aria-label={t.reply}
          placeholder={t.replyPlaceholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {t.send}
        </button>
      </div>
    </form>
  )
}
