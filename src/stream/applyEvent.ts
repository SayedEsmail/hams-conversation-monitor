import type { Message, Role, Status, StreamEvent } from '../api/types'

/**
 * One entry of a thread: a message, or a 'handoff' line whose text is the reason
 * the AI passed the conversation to a human.
 */
export interface ThreadEntry extends Omit<Message, 'role'> {
  role: Role | 'handoff'
}

/** A thread entry that arrived on the stream. */
export interface LiveMessage extends ThreadEntry {
  /**
   * The tokens of a streamed reply, each with its event id (empty for a message
   * that arrived complete). A snapshot fetched in the middle of a reply already
   * holds the first tokens, so the screen has to know which ones are newer.
   */
  tokens: { eventId: number; text: string }[]
  /** The stream joined in the middle of this reply, so `text` is only its tail. */
  partial?: boolean
}

export interface LiveState {
  /** Id of the last event applied. */
  lastEventId: number
  /** Thread entries from the stream, by conversation id, oldest first. */
  messages: Record<string, LiveMessage[]>
  /** Latest status of each conversation the stream has changed. */
  statuses: Record<string, Status>
}

export const initialLiveState: LiveState = { lastEventId: 0, messages: {}, statuses: {} }

/**
 * Returns the state after one event. It is a pure function: no clock, no network,
 * no React. `receivedAt` is passed in because `message_start` has no timestamp.
 */
export function applyEvent(state: LiveState, event: StreamEvent, receivedAt: string): LiveState {
  // After a reconnect the server replays events we already have. Ids only go up,
  // so anything at or below the last applied id is a duplicate.
  if (event.id <= state.lastEventId) return state

  const { conversationId } = event
  const next = { ...state, lastEventId: event.id }
  const messages = state.messages[conversationId] ?? []
  const withMessages = (updated: LiveMessage[]): LiveState => ({
    ...next,
    messages: { ...state.messages, [conversationId]: updated },
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
            conversationId,
            role: 'ai',
            text: '',
            createdAt: receivedAt,
            streaming: true,
            tokens: [],
            partial: event.type !== 'message_start',
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

    // The hand-off is shown as a line in the thread, so it is stored in the
    // thread, at the place where it happened.
    case 'tool_call':
      return withMessages([
        ...messages,
        {
          id: `handoff-${event.id}`,
          conversationId,
          role: 'handoff',
          text: event.args.reason,
          createdAt: receivedAt,
          tokens: [],
        },
      ])

    case 'status':
      return { ...next, statuses: { ...state.statuses, [conversationId]: event.status } }

    // An event type this client does not know still moves the last applied id forward.
    default:
      return next
  }
}
