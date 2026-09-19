import { api } from './client'
import type {
  BidEvaluationResult,
  DecisionJournalEntry,
  PortfolioCapacity
} from '@/types'

export interface EvaluateBidParams {
  opportunity_id: string
  margin_pct?: number
  effort_days?: number
  blended_day_rate?: number
}

export interface CommitDecisionParams {
  opportunity_id: string
  decision: 'pursue' | 'no_bid' | 'partner_needed' | 'watch'
  rationale: string
  assumptions?: string[]
  hard_gates_status?: any
  economic_evaluation?: any
  capacity_impact?: any
  partner_requirements?: string[]
}

export const decisionApi = {
  evaluate: (params: EvaluateBidParams) =>
    api.post<BidEvaluationResult>('/decision/evaluate', params).then(r => r.data),

  commit: (params: CommitDecisionParams) =>
    api.post<{ id: string; decision: string; message: string; application_id?: string }>('/decision/commit', params).then(r => r.data),

  getJournal: (limit: number = 50) =>
    api.get<DecisionJournalEntry[]>(`/decision/journal?limit=${limit}`).then(r => r.data),

  getPortfolio: () =>
    api.get<PortfolioCapacity>('/decision/portfolio').then(r => r.data),
}
