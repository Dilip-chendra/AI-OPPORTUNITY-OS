'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Scale, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  Clock, DollarSign, Users, ArrowRight, BookOpen, Layers,
  Calendar, Check, AlertCircle, RefreshCw, Send, ChevronRight
} from 'lucide-react'
import { decisionApi } from '@/lib/api/decision'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, cn } from '@/lib/utils'

export default function DecisionCenterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const oppIdParam = searchParams.get('opp_id')
  const [activeTab, setActiveTab] = useState<'workbench' | 'journal' | 'portfolio'>('workbench')
  const [selectedOppId, setSelectedOppId] = useState<string>(oppIdParam || '')
  
  // Custom economics inputs
  const [marginPct, setMarginPct] = useState<number>(30)
  const [effortDays, setEffortDays] = useState<number>(15)

  // Commit form state
  const [decisionChoice, setDecisionChoice] = useState<'pursue' | 'no_bid' | 'partner_needed' | 'watch'>('pursue')
  const [rationale, setRationale] = useState<string>('')
  const [assumptions, setAssumptions] = useState<string>('Standard resource assumptions and compliance review.')
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null)

  // Fetch opportunities for selector
  const { data: oppsData } = useQuery({
    queryKey: ['opportunities-list-decision'],
    queryFn: () => opportunitiesApi.list({ page_size: 25, sort_by: 'overall_score', sort_order: 'desc' }),
  })

  const opportunities = oppsData?.data || []

  // Default selection
  useEffect(() => {
    if (!selectedOppId && opportunities.length > 0) {
      setSelectedOppId(opportunities[0].id)
    }
  }, [opportunities, selectedOppId])

  // Fetch evaluation for selected opportunity
  const { 
    data: evaluation, 
    isLoading: evalLoading, 
    refetch: refetchEval 
  } = useQuery({
    queryKey: ['bid-evaluation', selectedOppId, marginPct, effortDays],
    queryFn: () => decisionApi.evaluate({
      opportunity_id: selectedOppId,
      margin_pct: marginPct,
      effort_days: effortDays
    }),
    enabled: !!selectedOppId,
  })

  // Synchronize decision choice with engine recommendation when evaluation arrives
  useEffect(() => {
    if (evaluation?.verdict) {
      setDecisionChoice(evaluation.verdict)
      if (!rationale) {
        setRationale(evaluation.verdict_reason)
      }
    }
  }, [evaluation?.verdict, evaluation?.verdict_reason, rationale])

  // Fetch Journal Entries
  const { data: journalEntries = [], isLoading: journalLoading } = useQuery({
    queryKey: ['decision-journal'],
    queryFn: () => decisionApi.getJournal(50),
    enabled: activeTab === 'journal',
  })

  // Fetch Portfolio Capacity Map
  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio-capacity'],
    queryFn: decisionApi.getPortfolio,
    enabled: activeTab === 'portfolio',
  })

  // Commit Mutation
  const commitMutation = useMutation({
    mutationFn: decisionApi.commit,
    onSuccess: (data) => {
      setCommitSuccess(data.message)
      queryClient.invalidateQueries({ queryKey: ['decision-journal'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio-capacity'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      setTimeout(() => {
        setCommitSuccess(null)
        setActiveTab('journal')
      }, 1400)
    }
  })

  const handleCommit = () => {
    if (!selectedOppId || !evaluation) return
    commitMutation.mutate({
      opportunity_id: selectedOppId,
      decision: decisionChoice,
      rationale: rationale || evaluation.verdict_reason,
      assumptions: assumptions.split('\n').map(s => s.trim()).filter(Boolean),
      hard_gates_status: evaluation.hard_gates,
      economic_evaluation: evaluation.economic_evaluation,
      capacity_impact: evaluation.capacity_impact,
      partner_requirements: evaluation.hard_gates?.unlock_strategy?.suggested_partner_profile 
        ? [evaluation.hard_gates.unlock_strategy.suggested_partner_profile] 
        : []
    })
  }

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'pursue':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">PURSUE</Badge>
      case 'partner_needed':
        return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">PARTNER NEEDED</Badge>
      case 'watch':
        return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">WATCHLIST</Badge>
      default:
        return <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">NO BID</Badge>
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[var(--text-1)]">
                Decision Center & Portfolio Optimizer
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                OpportunityOS 3.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-2)] mt-0.5">
              Rigorous Bid/No-Bid qualification separating Hard Gates from Soft Signals with institutional audit memory.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
          <button
            onClick={() => setActiveTab('workbench')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              activeTab === 'workbench' 
                ? "bg-[var(--surface)] text-[var(--text-1)] shadow-sm" 
                : "text-[var(--text-2)] hover:text-[var(--text-1)]"
            )}
          >
            Bid/No-Bid Workbench
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              activeTab === 'journal' 
                ? "bg-[var(--surface)] text-[var(--text-1)] shadow-sm" 
                : "text-[var(--text-2)] hover:text-[var(--text-1)]"
            )}
          >
            Decision Journal
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              activeTab === 'portfolio' 
                ? "bg-[var(--surface)] text-[var(--text-1)] shadow-sm" 
                : "text-[var(--text-2)] hover:text-[var(--text-1)]"
            )}
          >
            Portfolio & Capacity
          </button>
        </div>
      </div>

      {/* TAB 1: WORKBENCH */}
      {activeTab === 'workbench' && (
        <div className="space-y-6">
          {/* Opportunity Selector Bar */}
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">
                Select Radar Opportunity for Evaluation
              </label>
              <select
                value={selectedOppId}
                onChange={(e) => setSelectedOppId(e.target.value)}
                className="w-full md:w-[460px] text-sm bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              >
                {opportunities.map((opp: any) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title.slice(0, 65)} ({opp.organization_name || 'Buyer'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 text-xs text-[var(--text-2)]">
              <div>
                <span className="font-semibold text-[var(--text-1)]">Target Margin:</span>
                <input 
                  type="number" 
                  value={marginPct} 
                  onChange={(e) => setMarginPct(Number(e.target.value))}
                  className="w-16 ml-2 px-2 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)]"
                />%
              </div>
              <div>
                <span className="font-semibold text-[var(--text-1)]">Effort:</span>
                <input 
                  type="number" 
                  value={effortDays} 
                  onChange={(e) => setEffortDays(Number(e.target.value))}
                  className="w-16 ml-2 px-2 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)]"
                /> days
              </div>
              <Button size="sm" variant="outline" onClick={() => refetchEval()} className="h-8">
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Re-Score
              </Button>
            </div>
          </div>

          {evalLoading ? (
            <div className="p-12 text-center text-[var(--text-2)]">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              Evaluating multi-factor Bid/No-Bid readiness...
            </div>
          ) : evaluation ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Evaluation Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Executive Verdict Card */}
                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getVerdictBadge(evaluation.verdict)}
                        <span className="text-xs text-[var(--text-2)]">
                          OpportunityOS Strategic Recommendation
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-[var(--text-1)]">
                        {evaluation.opportunity_title}
                      </h2>
                      <p className="text-xs text-[var(--text-2)] mt-0.5">
                        Issued by <span className="font-semibold text-[var(--text-1)]">{evaluation.buyer}</span> • Category: <span className="capitalize">{evaluation.category}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-3xl font-black text-blue-500">
                        {evaluation.overall_score}<span className="text-sm text-[var(--text-2)] font-normal">/100</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-2)] font-medium mt-0.5">
                        {evaluation.win_probability_pct}% Win Prob.
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text-1)] leading-relaxed">
                    <span className="font-semibold text-blue-400">Verdict Rationale: </span>
                    {evaluation.verdict_reason}
                  </div>
                </div>

                {/* HARD GATES vs SOFT SIGNALS */}
                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-1)] flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        Hard Gates Verification (Mandatory Criteria)
                      </h3>
                      <p className="text-xs text-[var(--text-2)]">
                        Non-negotiable criteria that act as absolute pass/fail hurdles.
                      </p>
                    </div>
                    {evaluation.hard_gates?.all_passed ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> All Hard Gates Cleared
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> {evaluation.hard_gates?.failed_count} Gate Blocked
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {evaluation.hard_gates?.gates.map((gate, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "p-3 rounded-xl border flex items-start justify-between gap-3 text-xs",
                          gate.passed 
                            ? "bg-emerald-500/5 border-emerald-500/20 text-[var(--text-1)]" 
                            : "bg-rose-500/5 border-rose-500/20 text-[var(--text-1)]"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          {gate.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-semibold">{gate.name}</p>
                            <p className="text-[var(--text-2)] mt-0.5">{gate.detail}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded font-bold uppercase text-[10px] shrink-0",
                          gate.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        )}>
                          {gate.passed ? "PASS" : "BLOCKED"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actionable Unlock Strategy */}
                  {evaluation.hard_gates?.unlock_strategy && (
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          Unlock Strategy: {evaluation.hard_gates.unlock_strategy.title}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-1)]">
                        {evaluation.hard_gates.unlock_strategy.action}
                      </p>
                      {evaluation.hard_gates.unlock_strategy.remediation_steps?.length > 0 && (
                        <ul className="text-xs text-[var(--text-2)] list-disc pl-4 space-y-1 mt-2">
                          {evaluation.hard_gates.unlock_strategy.remediation_steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* ECONOMIC MODEL & PURSUIT ROI */}
                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
                  <h3 className="text-sm font-bold text-[var(--text-1)] flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    Bid Economics & Expected ROI Model
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <p className="text-[11px] text-[var(--text-2)]">Contract Value</p>
                      <p className="text-sm font-extrabold text-[var(--text-1)] mt-0.5">
                        {formatCurrency(evaluation.economic_evaluation.contract_value)}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <p className="text-[11px] text-[var(--text-2)]">Estimated Pursuit Cost</p>
                      <p className="text-sm font-extrabold text-[var(--text-1)] mt-0.5">
                        {formatCurrency(evaluation.economic_evaluation.estimated_pursuit_cost)}
                      </p>
                      <p className="text-[10px] text-[var(--text-2)]">({evaluation.economic_evaluation.estimated_effort_days} person-days)</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <p className="text-[11px] text-[var(--text-2)]">Expected Profit</p>
                      <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                        {formatCurrency(evaluation.economic_evaluation.expected_profit)}
                      </p>
                      <p className="text-[10px] text-[var(--text-2)]">({evaluation.economic_evaluation.target_margin_pct}% margin)</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <p className="text-[11px] text-[var(--text-2)]">Bid ROI Multiplier</p>
                      <p className="text-lg font-black text-blue-400 mt-0.5">
                        {evaluation.economic_evaluation.bid_roi_score}x
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Commit Decision Form */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5 sticky top-6">
                  <div className="border-b border-[var(--border)] pb-3">
                    <h3 className="text-sm font-bold text-[var(--text-1)] flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      Commit Decision to Journal
                    </h3>
                    <p className="text-xs text-[var(--text-2)] mt-0.5">
                      Writes an immutable decision record to build organizational learning.
                    </p>
                  </div>

                  {commitSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {commitSuccess}
                    </div>
                  )}

                  {/* Decision Options */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-2)]">
                      Executive Decision
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDecisionChoice('pursue')}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center",
                          decisionChoice === 'pursue'
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                            : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)]"
                        )}
                      >
                        PURSUE BID
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionChoice('partner_needed')}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center",
                          decisionChoice === 'partner_needed'
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                            : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)]"
                        )}
                      >
                        PARTNER FIRST
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionChoice('watch')}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center",
                          decisionChoice === 'watch'
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/40"
                            : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)]"
                        )}
                      >
                        WATCHLIST
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionChoice('no_bid')}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center",
                          decisionChoice === 'no_bid'
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/40"
                            : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)]"
                        )}
                      >
                        NO BID
                      </button>
                    </div>
                  </div>

                  {/* Rationale */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-2)]">
                      Strategic Rationale
                    </label>
                    <textarea
                      rows={3}
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      placeholder="Why is this decision being made?"
                      className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl p-3 outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Assumptions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-2)]">
                      Key Assumptions (One per line)
                    </label>
                    <textarea
                      rows={2}
                      value={assumptions}
                      onChange={(e) => setAssumptions(e.target.value)}
                      placeholder="List key assumptions..."
                      className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl p-3 outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Capacity impact note */}
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[11px] text-[var(--text-2)] space-y-1">
                    <div className="flex justify-between">
                      <span>Active concurrent pursuits:</span>
                      <span className="font-semibold text-[var(--text-1)]">{evaluation.capacity_impact.active_pursuits_count} of {evaluation.capacity_impact.max_recommended_concurrent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workload risk level:</span>
                      <span className={cn(
                        "font-semibold uppercase",
                        evaluation.capacity_impact.deadline_risk_level === 'high' ? "text-rose-400" : "text-emerald-400"
                      )}>{evaluation.capacity_impact.deadline_risk_level}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCommit}
                    disabled={commitMutation.isPending}
                    className="w-full h-10 font-bold text-xs uppercase tracking-wider"
                  >
                    {commitMutation.isPending ? "Logging Decision..." : "Commit Decision to Journal"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--text-2)]">
              Select an opportunity to evaluate.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DECISION JOURNAL */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--text-1)]">
                Institutional Decision Log
              </h2>
              <p className="text-xs text-[var(--text-2)]">
                Permanent audit trail of all pursuit decisions, recorded rationales, and qualification snapshots.
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--text-2)]">
              {journalEntries.length} Recorded Decisions
            </span>
          </div>

          {journalLoading ? (
            <div className="p-12 text-center text-[var(--text-2)]">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              Loading institutional memory...
            </div>
          ) : journalEntries.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)]">
              No decisions committed yet. Use the Bid/No-Bid Workbench to log your first qualification decision.
            </div>
          ) : (
            <div className="space-y-4">
              {journalEntries.map((entry) => (
                <div 
                  key={entry.id}
                  className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                    <div className="flex items-center gap-3">
                      {getVerdictBadge(entry.decision)}
                      <span className="text-sm font-bold text-[var(--text-1)]">
                        {entry.opportunity_title}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-2)] flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(entry.decided_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="md:col-span-2 space-y-2">
                      <p className="text-[var(--text-1)]">
                        <span className="font-semibold text-[var(--text-2)]">Rationale: </span>
                        {entry.rationale}
                      </p>
                      {entry.assumptions && entry.assumptions.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-[var(--surface-2)] text-[var(--text-2)]">
                          <span className="font-semibold text-[var(--text-1)]">Recorded Assumptions:</span>
                          <ul className="list-disc pl-4 mt-1 space-y-0.5">
                            {entry.assumptions.map((asm, idx) => (
                              <li key={idx}>{asm}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5 text-[11px] text-[var(--text-2)]">
                      <p><span className="font-semibold text-[var(--text-1)]">Buyer:</span> {entry.buyer}</p>
                      {entry.opportunity_value && (
                        <p><span className="font-semibold text-[var(--text-1)]">Value:</span> {formatCurrency(entry.opportunity_value)}</p>
                      )}
                      {entry.hard_gates_status && (
                        <p>
                          <span className="font-semibold text-[var(--text-1)]">Hard Gates:</span>{' '}
                          {entry.hard_gates_status.all_passed ? (
                            <span className="text-emerald-400 font-bold">Passed</span>
                          ) : (
                            <span className="text-amber-400 font-bold">{entry.hard_gates_status.failed_count} Blockers</span>
                          )}
                        </p>
                      )}
                      <div className="pt-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-xs w-full justify-between px-2"
                          onClick={() => {
                            setSelectedOppId(entry.opportunity_id)
                            setActiveTab('workbench')
                          }}
                        >
                          Review in Workbench <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PORTFOLIO & CAPACITY */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          {portfolioLoading ? (
            <div className="p-12 text-center text-[var(--text-2)]">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              Analyzing active portfolio bandwidth...
            </div>
          ) : portfolio ? (
            <div className="space-y-6">
              {/* Capacity Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  <p className="text-xs text-[var(--text-2)] font-medium">Active Pursuits</p>
                  <p className="text-2xl font-black text-[var(--text-1)] mt-1">
                    {portfolio.active_pursuits_count}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  <p className="text-xs text-[var(--text-2)] font-medium">Committed Effort</p>
                  <p className="text-2xl font-black text-[var(--text-1)] mt-1">
                    {portfolio.total_estimated_hours} <span className="text-sm font-normal text-[var(--text-2)]">hrs</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  <p className="text-xs text-[var(--text-2)] font-medium">Team Capacity</p>
                  <p className="text-2xl font-black text-[var(--text-1)] mt-1">
                    {portfolio.weekly_capacity_hours} <span className="text-sm font-normal text-[var(--text-2)]">hrs/wk</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  <p className="text-xs text-[var(--text-2)] font-medium">Bandwidth Status</p>
                  <div className="mt-1">
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider",
                      portfolio.capacity_status === 'overloaded' 
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    )}>
                      {portfolio.capacity_status} ({portfolio.utilization_pct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Deadline Collisions Alert Banner */}
              {portfolio.collisions_count > 0 && (
                <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="text-sm font-bold">
                      {portfolio.collisions_count} Deadline Collision(s) Detected
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-1)]">
                    Multiple proposals are due within 72 hours of each other. Preparation quality and technical review depth may be compromised without staggered drafting schedules.
                  </p>
                  <div className="space-y-2">
                    {portfolio.collisions.map((col, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[var(--surface)] border border-amber-500/20 text-xs space-y-1">
                        <div className="font-semibold text-[var(--text-1)]">
                          {col.pursuit_1} <span className="text-amber-400 font-normal">conflicts with</span> {col.pursuit_2}
                        </div>
                        <p className="text-[var(--text-2)] text-[11px]">
                          Due dates separated by only {col.gap_days} days. {col.warning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Pursuits Table */}
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-1)] flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-400" />
                  Active Pursuits Timeline
                </h3>

                {portfolio.pursuits.length === 0 ? (
                  <p className="text-xs text-[var(--text-2)] py-4">No active pursuits currently in pipeline.</p>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {portfolio.pursuits.map((p) => (
                      <div key={p.application_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[var(--text-1)] text-sm">{p.title}</p>
                          <p className="text-[var(--text-2)]">
                            Buyer: {p.buyer} • Stage: <span className="capitalize text-blue-400">{p.lifecycle_stage}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="font-bold text-[var(--text-1)]">{formatCurrency(p.value)}</p>
                            <p className="text-[11px] text-[var(--text-2)]">~{p.estimated_effort_hours} hrs effort</p>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-bold",
                              (p.days_remaining != null && p.days_remaining <= 5) ? "text-rose-400" : "text-emerald-400"
                            )}>
                              {p.days_remaining != null ? `${p.days_remaining}d left` : "Rolling"}
                            </p>
                            <p className="text-[10px] text-[var(--text-2)]">
                              {p.deadline ? new Date(p.deadline).toLocaleDateString() : "No deadline"}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-xs"
                            onClick={() => router.push(`/workspace/${p.application_id}`)}
                          >
                            Workspace
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
