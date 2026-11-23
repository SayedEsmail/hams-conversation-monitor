export type Role = 'customer' | 'ai' | 'human'

export type Status = 'ai' | 'needs_human' | 'human' | 'closed'

export interface Conversation {
  id: string
  customer: string
  status: Status
  lastMessage: string
  unread: number
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  role: Role
  text: string
  createdAt: string
  /** An AI reply that is still being written. */
  streaming?: true
  /** Echoed back from our POST, so we can match it with the optimistic copy. */
  clientMessageId?: string
}

/** Every event has an id that goes up by one across the whole stream. */
export type StreamEvent =
  | { id: number; type: 'message'; conversationId: string; message: Message }
  | { id: number; type: 'message_start'; conversationId: string; messageId: string; role: 'ai' }
  | { id: number; type: 'token'; conversationId: string; messageId: string; text: string }
  | { id: number; type: 'message_end'; conversationId: string; messageId: string }
  | {
      id: number
      type: 'tool_call'
      conversationId: string
      name: 'transfer_to_human'
      args: { reason: string }
    }
  | { id: number; type: 'status'; conversationId: string; status: Status }

/** `lastEventId` is the last event the returned data already includes. */
export interface ConversationsResponse {
  lastEventId: number
  conversations: Conversation[]
}

export interface MessagesResponse {
  lastEventId: number
  messages: Message[]
}
