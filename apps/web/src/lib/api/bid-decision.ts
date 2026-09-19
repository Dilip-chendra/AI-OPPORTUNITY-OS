import { api } from './client'

export interface BidDecisionResult {
  recommendation: 'pursue' | 'no_bid' | 'partner' | 'watch'
  overall_score: number
  confidence: number
  risk_factors: string[]
  strengths: string[]
  resource_estimate: string
  partner_needed: boolean
  reason: string
}

export const bidDecisionApi = {
  simulate: (opportunityId: string) =>
    api.post<BidDecisionResult>('/bid-decision/simulate', { opportunity_id: opportunityId }).then(r => r.data),
}
