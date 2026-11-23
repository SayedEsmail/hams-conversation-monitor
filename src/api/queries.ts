import { useQuery } from '@tanstack/react-query'
import { fetchConversations } from './client'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  })
}
