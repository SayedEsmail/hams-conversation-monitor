import { ConversationList } from './components/ConversationList'

function App() {
  return (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">Conversation Monitor</h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-80 shrink-0 overflow-y-auto border-e border-slate-200 bg-white">
          <ConversationList />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <p className="m-auto text-sm text-slate-500">Select a conversation</p>
        </main>
      </div>
    </div>
  )
}

export default App
