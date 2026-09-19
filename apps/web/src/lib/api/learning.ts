import { api } from './client'
import type { LearningPulse } from '@/types'

export interface RecordOutcomeParams {
  opportunity_id: string
  application_id?: string | null
  outcome: 'won' | 'lost' | 'no_bid' | 'disqualified' | 'withdrawn' | 'expired'
  award_value?: number | null
  currency?: string
  winner_name?: string | null
  primary_reason_category?: string
  detailed_retrospective?: string
  lessons_learned?: string[]
  reusable_artifacts?: any[]
}

export const learningApi = {
  recordOutcome: (params: RecordOutcomeParams) =>
    api.post<{ id: string; outcome: string; message: string }>('/learning/outcomes', params).then(r => r.data),

  getPulse: () =>
    api.get<LearningPulse>('/learning/pulse').then(r => r.data),
}
