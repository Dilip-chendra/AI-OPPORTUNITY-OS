import { api } from './client'

export interface LifecycleEvent {
  stage: string
  timestamp: string
  actor_id?: string
  notes?: string
}

export const lifecycleApi = {
  transition: (applicationId: string, stage: string, notes?: string) =>
    api.post(`/lifecycle/${applicationId}/transition`, { stage, notes }).then(r => r.data),
  timeline: (applicationId: string) =>
    api.get<LifecycleEvent[]>(`/lifecycle/${applicationId}/timeline`).then(r => r.data),
}
