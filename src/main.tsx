import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// REST responses are snapshots: we load each one once and the event stream
// keeps the screen up to date after that. `staleTime: Infinity` stops
// TanStack Query from refetching a snapshot on its own (window focus, remount).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: 1 },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
