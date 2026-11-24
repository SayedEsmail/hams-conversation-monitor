import type { Message, MessagesResponse } from '../api/types'
import type { LiveMessage, ThreadEntry } from './applyEvent'

/**
 * Builds the thread shown on screen from the messages loaded over REST (the
 * snapshot) and the entries that arrived on the stream.
 */
export function mergeThread(snapshot: MessagesResponse, live: LiveMessage[]): ThreadEntry[] {
  const liveIds = new Set(live.map((entry) => entry.id))

  // Messages the stream never touched are older than every live entry.
  const older: Message[] = []
  // Messages that are in both: the snapshot was taken after the stream started.
  const loaded = new Map<string, Message>()
  for (const message of snapshot.messages) {
    if (liveIds.has(message.id)) loaded.set(message.id, message)
    else older.push(message)
  }

  const newer = live.map((entry): ThreadEntry => {
    const copy = loaded.get(entry.id)
    // Not in the snapshot: all of it came from the stream.
    if (!copy) return entry
    // Already complete in the snapshot.
    if (!copy.streaming) return copy
    // The snapshot caught the reply half-written. It holds the text up to its
    // own lastEventId, so we add only the tokens that arrived after that.
    const rest = entry.tokens.filter((token) => token.eventId > snapshot.lastEventId)
    return { ...entry, text: copy.text + rest.map((token) => token.text).join('') }
  })

  return [...older, ...newer]
}
