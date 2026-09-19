import { describe, it, expect } from 'vitest'
import { decisionApi } from '@/lib/api/decision'
import { learningApi } from '@/lib/api/learning'
import type { 
  BidEvaluationResult, 
  DecisionJournalEntry, 
  PortfolioCapacity,
  LearningPulse 
} from '@/types'

describe('OpportunityOS 3.0: Decision & Learning API and Types', () => {
  it('exposes all decision API endpoints', () => {
    expect(typeof decisionApi.evaluate).toBe('function')
    expect(typeof decisionApi.commit).toBe('function')
    expect(typeof decisionApi.getJournal).toBe('function')
    expect(typeof decisionApi.getPortfolio).toBe('function')
  })

  it('exposes all learning API endpoints', () => {
    expect(typeof learningApi.recordOutcome).toBe('function')
    expect(typeof learningApi.getPulse).toBe('function')
  })

  it('correctly models HardGates and BidEvaluationResult data contract', () => {
    const sampleEval: BidEvaluationResult = {
      opportunity_id: 'opp-123',
      opportunity_title: 'State AI Surveillance System',
      category: 'government',
      buyer: 'State Police Department',
      verdict: 'pursue',
      verdict_reason: 'High qualification fit and viable economics.',
      overall_score: 92.5,
      win_probability_pct: 78.5,
      hard_gates: {
        all_passed: true,
        failed_count: 0,
        gates: [
          { name: 'Submission Deadline', category: 'timeline', passed: true, detail: '14 days remaining' },
          { name: 'Mandatory Certifications', category: 'compliance', passed: true, detail: 'ISO 27001 verified' }
        ],
        unlock_strategy: {
          status: 'PURSUIT_READY',
          title: 'Direct Pursuit Ready',
          action: 'Proceed with bid preparation',
          remediation_steps: ['Assign capture lead']
        }
      },
      economic_evaluation: {
        contract_value: 25000000,
        currency: 'INR',
        target_margin_pct: 30,
        estimated_effort_days: 15,
        estimated_pursuit_cost: 120000,
        expected_profit: 7500000,
        risk_weighted_expected_value: 5887500,
        bid_roi_score: 49.06
      },
      capacity_impact: {
        active_pursuits_count: 2,
        max_recommended_concurrent: 4,
        bandwidth_available: true,
        deadline_risk_level: 'low',
        team_bandwidth_hours: 120
      },
      strengths: ['Capability: Direct AI fit']
    }

    expect(sampleEval.hard_gates.all_passed).toBe(true)
    expect(sampleEval.verdict).toBe('pursue')
    expect(sampleEval.economic_evaluation.bid_roi_score).toBeGreaterThan(1.5)
  })

  it('correctly models LearningPulse and RecurrentBlockers data contract', () => {
    const samplePulse: LearningPulse = {
      total_outcomes: 5,
      win_count: 3,
      loss_count: 2,
      disqualified_count: 0,
      win_rate_pct: 60.0,
      total_won_value: 75000000,
      recurrent_blockers: [
        {
          category: 'pricing_commercial',
          label: 'Aggressive Competitor Pricing',
          frequency: 2,
          severity: 'medium',
          remediation: 'Incorporate automated should-cost model'
        }
      ],
      loss_reason_breakdown: [{ category: 'pricing_commercial', count: 2, label: 'Pricing' }],
      lessons_learned: [{ lesson: 'Live POC creates advantage', outcome: 'won', opportunity_title: 'Surveillance Tender' }],
      reusable_artifacts: [{ title: 'System Architecture Diagram', type: 'technical_architecture' }],
      recent_retrospectives: []
    }

    expect(samplePulse.win_rate_pct).toBe(60.0)
    expect(samplePulse.recurrent_blockers.length).toBe(1)
    expect(samplePulse.recurrent_blockers[0].category).toBe('pricing_commercial')
  })
})
