import { create } from 'zustand'
import { initialLiveState, type LiveState } from '../stream/applyEvent'

interface AppState {
  selectedConversationId: string | null
  selectConversation: (conversationId: string) => void
  /** Everything the event stream has delivered since the conversation list was loaded. */
  live: LiveState
  connection: 'connecting' | 'connected' | 'reconnecting'
}

export const useAppStore = create<AppState>()((set) => ({
  selectedConversationId: null,
  selectConversation: (conversationId) => set({ selectedConversationId: conversationId }),
  live: initialLiveState,
  connection: 'connecting',
}))
