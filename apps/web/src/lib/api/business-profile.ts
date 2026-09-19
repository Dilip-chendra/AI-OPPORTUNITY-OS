import { api } from './client'
import type { BusinessProfile } from '@/types'

export const businessProfileApi = {
  get: () => api.get<BusinessProfile>('/business-profile').then(r => r.data),
  update: (data: Partial<BusinessProfile>) => api.put<BusinessProfile>('/business-profile', data).then(r => r.data),
  addDocument: (data: { title: string; document_type: string; file_url?: string }) =>
    api.post<BusinessProfile>('/business-profile/documents', data).then(r => r.data),
  removeDocument: (id: string) =>
    api.delete<BusinessProfile>(`/business-profile/documents/${id}`).then(r => r.data),
  completeOnboarding: () => api.post('/business-profile/complete-onboarding').then(r => r.data),
}
