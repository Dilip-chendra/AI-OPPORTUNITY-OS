import { api } from './client'
import type { Notification, PaginatedResponse } from '@/types'

export const alertsApi = {
  list: (params?: { page?: number; page_size?: number; unread_only?: boolean }) =>
    api.get<PaginatedResponse<Notification>>('/alerts', { params }).then(r => r.data),
  markRead: (id: string) => api.post(`/alerts/${id}/read`).then(r => r.data),
  markAllRead: () => api.post('/alerts/read-all').then(r => r.data),
}
