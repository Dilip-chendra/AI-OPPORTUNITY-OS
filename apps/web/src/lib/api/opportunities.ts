import { api } from './client'
import type { Opportunity, OpportunityFilters, PaginatedResponse } from '@/types'

export const opportunitiesApi = {
  list: (filters?: OpportunityFilters) =>
    api.get<PaginatedResponse<Opportunity>>('/opportunities', { params: filters }).then(r => r.data),
  get: (id: string) => api.get<Opportunity>(`/opportunities/${id}`).then(r => r.data),
  save: (id: string) => api.post(`/opportunities/${id}/save`).then(r => r.data),
  unsave: (id: string) => api.delete(`/opportunities/${id}/save`).then(r => r.data),
  saved: () => api.get<Opportunity[]>('/opportunities/saved').then(r => r.data),
  recommendations: (limit = 10) =>
    api.get<Opportunity[]>('/opportunities/recommendations', { params: { limit } }).then(r => r.data),
  stats: () => api.get<{
    total: number; matched: number; high_relevance: number; urgent: number;
    by_category: Record<string, number>;
  }>('/opportunities/stats').then(r => r.data),
  why: (id: string) => api.get<any>(`/opportunities/${id}/why`).then(r => r.data),
  health: (id: string) => api.get<any>(`/opportunities/${id}/health`).then(r => r.data),
}
