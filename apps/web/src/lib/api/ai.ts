import { api } from './client'
import type { AIConversation } from '@/types'

export const aiApi = {
  chat: (message: string, conversationId?: string) =>
    api.post<{ response: string; conversation_id: string }>('/ai/chat', { message, conversation_id: conversationId }).then(r => r.data),
  conversations: () => api.get<AIConversation[]>('/ai/conversations').then(r => r.data),
  conversation: (id: string) => api.get<AIConversation>(`/ai/conversations/${id}`).then(r => r.data),
}
