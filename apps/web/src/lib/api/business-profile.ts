import { api } from './client'
import type { BusinessProfile } from '@/types'

export const businessProfileApi = {
  get: () => api.get<BusinessProfile>('/business-profile').then(r => r.data),
  update: (data: Partial<BusinessProfile>) => api.put<BusinessProfile>('/business-profile', data).then(r => r.data),
  completeOnboarding: () => api.post('/business-profile/complete-onboarding').then(r => r.data),
}
