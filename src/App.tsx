import { useEffect } from 'react'
import { useConversations } from './api/queries'
import { ConnectionBadge } from './components/ConnectionBadge'
import { ConversationList } from './components/ConversationList'
import { ConversationThread } from './components/ConversationThread'
import { useText } from './i18n'
import { useAppStore } from './store/appStore'
import { connectStream } from './stream/connectStream'

function App() {
  // The stream continues from the point where the conversation list stops, so it
  // can only start once the list has loaded.
  const startId = useConversations().data?.lastEventId

  useEffect(() => {
    if (startId === undefined) return
    // connectStream returns a function that closes the stream. Returning it here
    // makes it the effect's cleanup, so there is never more than one connection.
    return connectStream(startId)
  }, [startId])

  const lang = useAppStore((state) => state.lang)
  const toggleLanguage = useAppStore((state) => state.toggleLanguage)
  const t = useText()

  return (
    // The language decides the direction, and the whole layout follows this one
    // `dir` attribute, because the styles only use start and end, never left
    // and right.
    <div
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="flex h-dvh bg-slate-100 p-3 text-slate-900"
    >
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
          <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            {/* The logo: a chat bubble. aria-hidden, because the name next to it
                already says what this is. In RTL the bubble's tail is mirrored. */}
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 rtl:-scale-x-100">
                <path d="M5 4h14a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-7l-5 4v-4H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" />
              </svg>
            </span>
            {t.title}
          </h1>
          <div className="flex items-center gap-4">
            <ConnectionBadge />
            <button
              type="button"
              onClick={toggleLanguage}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
            >
              {t.otherLanguage}
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside
            aria-labelledby="conversations-title"
            // 28% of the window, but never narrower than 20rem or wider than 28rem.
            className="flex w-[28%] max-w-md min-w-80 shrink-0 flex-col border-e border-slate-200"
          >
            <h2 id="conversations-title" className="px-4 py-3 text-lg font-bold">
              {t.conversations}
            </h2>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ConversationList />
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col bg-slate-100">
            <ConversationThread />
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
