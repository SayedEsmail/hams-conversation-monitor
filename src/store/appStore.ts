import { create } from 'zustand'
import type { Conversation } from '../api/types'
import { initialLiveState, type LiveState } from '../stream/applyEvent'

interface AppState {
  selectedConversationId: string | null
  selectConversation: (conversationId: string) => void
  /** How many live entries each conversation had when the user last looked at it. */
  seen: Record<string, number>
  /** Everything the event stream has delivered since the conversation list was loaded. */
  live: LiveState
  connection: 'connecting' | 'connected' | 'reconnecting'
}

export const useAppStore = create<AppState>()((set) => ({
  selectedConversationId: null,
  selectConversation: (conversationId) =>
    set((state) => {
      // Opening a conversation marks it as read, and so does leaving it:
      // whatever arrived while it was open has been seen.
      const seen = { ...state.seen }
      for (const id of [state.selectedConversationId, conversationId]) {
        if (id) seen[id] = state.live.messages[id]?.length ?? 0
      }
      return { selectedConversationId: conversationId, seen }
    }),
  seen: {},
  live: initialLiveState,
  connection: 'connecting',
}))

/** A status event from the stream is always newer than the loaded list. */
export function useStatus(conversation: Conversation) {
  return useAppStore((state) => state.live.statuses[conversation.id]) ?? conversation.status
}
