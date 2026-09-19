import { api } from './client'
import type {
  BusinessProfile,
  BusinessContext,
  CompletenessResult,
  ReadinessResult,
  DNAImpact,
  BusinessProfileVersion
} from '@/types'

export const businessProfileApi = {
  get: () => api.get<BusinessProfile>('/business-profile').then(r => r.data),
  update: (data: Partial<BusinessProfile>) => api.put<{ profile: BusinessProfile; version: number; impact?: DNAImpact }>('/business-profile', data).then(r => r.data),
  getContext: () => api.get<BusinessContext>('/business-profile/context').then(r => r.data),
  getCompleteness: () => api.get<CompletenessResult>('/business-profile/completeness').then(r => r.data),
  getReadiness: () => api.get<ReadinessResult>('/business-profile/readiness').then(r => r.data),
  getImpact: () => api.get<DNAImpact>('/business-profile/impact').then(r => r.data),
  getVersions: () => api.get<BusinessProfileVersion[]>('/business-profile/versions').then(r => r.data),
  addDocument: (data: { title: string; document_type: string; file_url?: string }) =>
    api.post<BusinessProfile>('/business-profile/documents', data).then(r => r.data),
  removeDocument: (id: string) =>
    api.delete<BusinessProfile>(`/business-profile/documents/${id}`).then(r => r.data),
  completeOnboarding: () => api.post('/business-profile/complete-onboarding').then(r => r.data),
}

