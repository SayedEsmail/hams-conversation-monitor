import { useEffect } from 'react'
import { useConversations } from './api/queries'
import { ConnectionBadge } from './components/ConnectionBadge'
import { ConversationList } from './components/ConversationList'
import { ConversationThread } from './components/ConversationThread'
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

  return (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">Conversation Monitor</h1>
        <ConnectionBadge />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-80 shrink-0 overflow-y-auto border-e border-slate-200 bg-white">
          <ConversationList />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <ConversationThread />
        </main>
      </div>
    </div>
  )
}

export default App
