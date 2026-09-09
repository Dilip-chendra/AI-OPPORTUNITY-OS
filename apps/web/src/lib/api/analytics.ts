import { api } from './client'
import type { AnalyticsOverview } from '@/types'

export const analyticsApi = {
  overview: () => api.get<AnalyticsOverview>('/analytics/overview').then(r => r.data),
}
