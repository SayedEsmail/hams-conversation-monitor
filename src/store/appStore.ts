import { create } from 'zustand'

interface AppState {
  selectedConversationId: string | null
  selectConversation: (conversationId: string) => void
}

export const useAppStore = create<AppState>()((set) => ({
  selectedConversationId: null,
  selectConversation: (conversationId) => set({ selectedConversationId: conversationId }),
}))
