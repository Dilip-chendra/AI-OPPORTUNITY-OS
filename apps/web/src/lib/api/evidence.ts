import { api } from './client'

export interface EvidenceDocument {
  id: string
  organization_id?: string
  title: string
  document_type: string
  file_url?: string
  expiry_date?: string
  is_expired?: boolean
  tags?: string[]
  used_in_applications?: string[]
  created_at: string
  updated_at?: string
}

export const evidenceApi = {
  list: () => api.get<EvidenceDocument[]>('/evidence').then(r => r.data),
  create: (data: Partial<EvidenceDocument>) => api.post<EvidenceDocument>('/evidence', data).then(r => r.data),
  delete: (id: string) => api.delete(`/evidence/${id}`).then(r => r.data),
  expiring: (days = 60) => api.get<EvidenceDocument[]>('/evidence/expiring', { params: { days } }).then(r => r.data),
}
