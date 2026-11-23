import type { Conversation, ConversationsResponse, Message, MessagesResponse } from './types'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

/** An HTTP response with a non-2xx status. `status` lets callers tell a 409 from a 500. */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)

  // fetch only rejects on a network failure. A 409 or 500 still resolves,
  // so we have to turn it into an error ourselves.
  if (!response.ok) {
    const body: { error?: string } | null = await response.json().catch(() => null)
    throw new ApiError(response.status, body?.error ?? `Request failed (${response.status})`)
  }

  return (await response.json()) as T
}

export function fetchConversations() {
  return request<ConversationsResponse>('/conversations')
}

export function fetchMessages(conversationId: string) {
  return request<MessagesResponse>(`/conversations/${conversationId}/messages`)
}

export function takeOver(conversationId: string) {
  return request<{ conversation: Conversation }>(`/conversations/${conversationId}/takeover`, {
    method: 'POST',
  })
}

export function sendMessage(conversationId: string, text: string, clientMessageId: string) {
  return request<{ message: Message }>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, clientMessageId }),
  })
}
