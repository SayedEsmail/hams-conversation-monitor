import { API_URL } from '../api/client'
import type { StreamEvent } from '../api/types'
import { useAppStore } from '../store/appStore'
import { applyEvent, initialLiveState } from './applyEvent'

/**
 * Opens the event stream and keeps it open: when the connection drops, it opens
 * a new one from the last event applied. Returns a function that closes it.
 */
export function connectStream(startId: number) {
  let source: EventSource
  let retryTimer: number | undefined
  let failures = 0

  // The conversation list already includes every event up to `startId`.
  useAppStore.setState({ live: { ...initialLiveState, lastEventId: startId } })

  function open() {
    const { lastEventId } = useAppStore.getState().live
    source = new EventSource(`${API_URL}/events?since=${lastEventId}`)

    source.onopen = () => {
      failures = 0
      useAppStore.setState({ connection: 'connected' })
    }

    source.onmessage = ({ data }) => {
      const event: StreamEvent = JSON.parse(data)
      useAppStore.setState((state) => ({
        live: applyEvent(state.live, event, new Date().toISOString()),
      }))
    }

    // EventSource reconnects on its own, but it reuses the first URL, and this
    // server reads `since` from the URL before the Last-Event-ID header. Every
    // drop would replay the stream from the very first id again. So we close it
    // and open a new one from where we are, waiting a little longer each time
    // the server stays unreachable.
    source.onerror = () => {
      source.close()
      useAppStore.setState({ connection: 'reconnecting' })
      retryTimer = window.setTimeout(open, Math.min(500 * 2 ** failures, 10_000))
      failures += 1
    }
  }

  open()

  return () => {
    window.clearTimeout(retryTimer)
    source.close()
  }
}
