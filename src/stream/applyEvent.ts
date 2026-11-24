import type { Message, StreamEvent } from '../api/types'

/** A message that arrived on the stream. */
export interface LiveMessage extends Message {
  /**
   * The tokens of a streamed reply, each with its event id (empty for a message
   * that arrived complete). A snapshot fetched in the middle of a reply already
   * holds the first tokens, so the screen has to know which ones are newer.
   */
  tokens: { eventId: number; text: string }[]
}

export interface LiveState {
  /** Id of the last event applied. */
  lastEventId: number
  /** Messages from the stream, by conversation id, oldest first. */
  messages: Record<string, LiveMessage[]>
}

export const initialLiveState: LiveState = { lastEventId: 0, messages: {} }

/**
 * Returns the state after one event. It is a pure function: no clock, no network,
 * no React. `receivedAt` is passed in because `message_start` has no timestamp.
 */
export function applyEvent(state: LiveState, event: StreamEvent, receivedAt: string): LiveState {
  // After a reconnect the server replays events we already have. Ids only go up,
  // so anything at or below the last applied id is a duplicate.
  if (event.id <= state.lastEventId) return state

  const messages = state.messages[event.conversationId] ?? []
  const withMessages = (updated: LiveMessage[]): LiveState => ({
    lastEventId: event.id,
    messages: { ...state.messages, [event.conversationId]: updated },
  })

  switch (event.type) {
    case 'message':
      return withMessages([...messages, { ...event.message, tokens: [] }])

    case 'message_start':
    case 'token':
    case 'message_end': {
      // The stream can connect in the middle of a reply, so any of the three can
      // be the first event we see for a message.
      const existing = messages.find((message) => message.id === event.messageId)
      const message: LiveMessage = existing
        ? { ...existing }
        : {
            id: event.messageId,
            conversationId: event.conversationId,
            role: 'ai',
            text: '',
            createdAt: receivedAt,
            streaming: true,
            tokens: [],
          }

      if (event.type === 'token') {
        message.text += event.text
        message.tokens = [...message.tokens, { eventId: event.id, text: event.text }]
      }
      if (event.type === 'message_end') delete message.streaming

      return withMessages(
        existing ? messages.map((m) => (m === existing ? message : m)) : [...messages, message],
      )
    }

    // Events we do not handle yet still move the last applied id forward.
    default:
      return { ...state, lastEventId: event.id }
  }
}
