import { api } from './client'
import type { Application } from '@/types'

export interface ComplianceClause {
  clause_id: string
  requirement_text: string
  compliance_status: string
  confidence_score: number
  gap_analysis: string
  evidence_document: string
}

export interface ApplicationDetail extends Application {
  opportunity?: any
}

export const applicationsApi = {
  list: () =>
    api.get<Application[]>('/applications').then((r) => (Array.isArray(r.data) ? r.data : (r.data as any).data || [])),
  
  get: (id: string) =>
    api.get<ApplicationDetail>(`/applications/${id}`).then((r) => r.data),
  
  create: (data: { opportunity_id: string; title?: string }) =>
    api.post<Application>('/applications', data).then((r) => r.data),
  
  updateStatus: (id: string, status: string) =>
    api.put<Application>(`/applications/${id}?status=${status}`).then((r) => r.data),
  
  getComplianceMatrix: (id: string) =>
    api.get<{ application_id: string; matrix: ComplianceClause[] }>(`/applications/${id}/compliance-matrix`).then((r) => r.data.matrix),
  
  draftProposal: (id: string, section_type: string) =>
    api.post<{ section_type: string; content: string }>(`/applications/${id}/draft-proposal`, { section_type }).then((r) => r.data.content),
}
