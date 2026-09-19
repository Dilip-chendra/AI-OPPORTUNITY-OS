import { api } from './client'
import type {
  OpportunityThread,
  Buyer360,
  WhitespaceResult,
  WorkQueueResult,
  SimulationScenario,
  SimulationResult
} from '@/types'

export const intelligenceApi = {
  getThread: (opportunityId: string) =>
    api.get<OpportunityThread>(`/intelligence/threads/${opportunityId}`).then(r => r.data),

  getBuyer360: (buyerName: string) =>
    api.get<Buyer360>(`/intelligence/buyers/${encodeURIComponent(buyerName)}`).then(r => r.data),

  getWhitespace: () =>
    api.get<WhitespaceResult>('/intelligence/whitespace').then(r => r.data),

  getWorkQueue: () =>
    api.get<WorkQueueResult>('/intelligence/work-queue').then(r => r.data),

  simulate: (scenario: SimulationScenario) =>
    api.post<SimulationResult>('/intelligence/simulate', scenario).then(r => r.data),
}
