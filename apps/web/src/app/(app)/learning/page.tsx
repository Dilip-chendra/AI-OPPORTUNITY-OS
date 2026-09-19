'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { 
  Brain, Trophy, AlertOctagon, TrendingUp, BookOpen, Plus, 
  CheckCircle2, XCircle, Clock, ShieldAlert, Sparkles, RefreshCw, 
  FileText, Lightbulb, ChevronRight
} from 'lucide-react'
import { learningApi, RecordOutcomeParams } from '@/lib/api/learning'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, cn } from '@/lib/utils'

export default function OutcomeLearningPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'pulse' | 'retrospectives' | 'artifacts'>('pulse')
  const [showModal, setShowModal] = useState<boolean>(false)

  // Form state for recording an outcome
  const [oppId, setOppId] = useState<string>('')
  const [outcome, setOutcome] = useState<'won' | 'lost' | 'disqualified' | 'withdrawn'>('won')
  const [awardValue, setAwardValue] = useState<string>('15000000')
  const [winnerName, setWinnerName] = useState<string>('')
  const [reasonCat, setReasonCat] = useState<string>('technical_score')
  const [retrospective, setRetrospective] = useState<string>('')
  const [lessons, setLessons] = useState<string>('')
  const [artifactTitle, setArtifactTitle] = useState<string>('')

  // Fetch opportunities for modal dropdown
  const { data: oppsData } = useQuery({
    queryKey: ['opportunities-learning-select'],
    queryFn: () => opportunitiesApi.list({ page_size: 25 }),
  })
  const opportunities = oppsData?.data || []

  // Fetch Learning Pulse
  const { data: pulse, isLoading: pulseLoading } = useQuery({
    queryKey: ['learning-pulse'],
    queryFn: learningApi.getPulse,
  })

  // Record outcome mutation
  const recordMutation = useMutation({
    mutationFn: learningApi.recordOutcome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-pulse'] })
      setShowModal(false)
      // reset form
      setRetrospective('')
      setLessons('')
      setArtifactTitle('')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!oppId) return

    const artifacts = artifactTitle ? [{
      title: artifactTitle,
      type: 'proposal_section',
      summary: `Indexed from ${outcome} submission`
    }] : []

    const lessonsList = lessons.split('\n').map(l => l.trim()).filter(Boolean)

    recordMutation.mutate({
      opportunity_id: oppId,
      outcome,
      award_value: awardValue ? Number(awardValue) : null,
      winner_name: winnerName || undefined,
      primary_reason_category: reasonCat,
      detailed_retrospective: retrospective,
      lessons_learned: lessonsList,
      reusable_artifacts: artifacts
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[var(--text-1)]">
                Outcome Intelligence & Learning Loop
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Institutional Memory
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-2)] mt-0.5">
              Transforms win/loss post-mortems into recurring competitive advantage, calibrated match weights, and reusable proposal IP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Selector */}
          <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setActiveTab('pulse')}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
                activeTab === 'pulse' 
                  ? "bg-[var(--surface)] text-[var(--text-1)] shadow-sm" 
                  : "text-[var(--text-2)] hover:text-[var(--text-1)]"
              )}
            >
              Learning Pulse
            </button>
            <button
              onClick={() => setActiveTab('retrospectives')}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
                activeTab === 'retrospectives' 
                  ? "bg-[var(--surface)] text-[var(--text-1)] shadow-sm" 
                  : "text-[var(--text-2)] hover:text-[var(--text-1)]"
              )}
            >
              Retrospectives
            </button>
            <button
              onClick={() => setActiveTab('artifacts')}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
                activeTab === 'artifacts' 
                  ? "bg-[var(--surface)] text-[var(--text-1)] shadow-sm" 
                  : "text-[var(--text-2)] hover:text-[var(--text-1)]"
              )}
            >
              Reusable Artifacts
            </button>
          </div>

          <Button 
            size="sm" 
            onClick={() => {
              if (opportunities.length > 0 && !oppId) {
                setOppId(opportunities[0].id)
              }
              setShowModal(true)
            }}
            className="h-9 gap-1.5 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Record Outcome
          </Button>
        </div>
      </div>

      {pulseLoading ? (
        <div className="p-12 text-center text-[var(--text-2)]">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-500" />
          Aggregating institutional outcomes...
        </div>
      ) : pulse ? (
        <div className="space-y-8">
          {/* Executive Pulse KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <p className="text-xs text-[var(--text-2)] font-medium flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-400" /> Win Rate
              </p>
              <p className="text-3xl font-black text-[var(--text-1)]">
                {pulse.win_rate_pct}<span className="text-sm font-normal text-[var(--text-2)]">%</span>
              </p>
              <p className="text-[11px] text-[var(--text-2)]">{pulse.win_count} won / {pulse.total_outcomes} total</p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <p className="text-xs text-[var(--text-2)] font-medium flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Total Won Value
              </p>
              <p className="text-2xl font-black text-emerald-400">
                {formatCurrency(pulse.total_won_value)}
              </p>
              <p className="text-[11px] text-[var(--text-2)]">Cumulative contract awards</p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <p className="text-xs text-[var(--text-2)] font-medium flex items-center gap-1.5">
                <AlertOctagon className="h-3.5 w-3.5 text-rose-400" /> Loss & Disqualifications
              </p>
              <p className="text-3xl font-black text-rose-400">
                {pulse.loss_count + pulse.disqualified_count}
              </p>
              <p className="text-[11px] text-[var(--text-2)]">{pulse.disqualified_count} compliance gates failed</p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <p className="text-xs text-[var(--text-2)] font-medium flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-blue-400" /> Indexed IP Assets
              </p>
              <p className="text-3xl font-black text-blue-400">
                {pulse.reusable_artifacts.length}
              </p>
              <p className="text-[11px] text-[var(--text-2)]">Winning proposal sections</p>
            </div>
          </div>

          {/* TAB 1: PULSE & RECURRENT BLOCKERS */}
          {activeTab === 'pulse' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recurrent Blockers Diagnostic */}
              <div className="lg:col-span-2 p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
                <div className="border-b border-[var(--border)] pb-3">
                  <h2 className="text-base font-bold text-[var(--text-1)] flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    Recurrent Qualification Blockers & Root Causes
                  </h2>
                  <p className="text-xs text-[var(--text-2)]">
                    Systemic bottlenecks that have repeatedly caused proposal disqualification or technical score penalties.
                  </p>
                </div>

                {pulse.recurrent_blockers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-2)]">
                    No recurrent blockers recorded yet. Track outcomes to detect systemic win rate barriers.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pulse.recurrent_blockers.map((b, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "p-4 rounded-xl border space-y-2",
                          b.severity === 'high' 
                            ? "bg-rose-500/5 border-rose-500/20" 
                            : "bg-amber-500/5 border-amber-500/20"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded font-bold uppercase text-[10px]",
                              b.severity === 'high' ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"
                            )}>
                              {b.frequency}x Observed
                            </span>
                            <h3 className="text-xs font-bold text-[var(--text-1)]">{b.label}</h3>
                          </div>
                        </div>
                        <p className="text-xs text-[var(--text-2)]">
                          <span className="font-semibold text-blue-400">Institutional Remedy: </span>
                          {b.remediation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actionable Takeaways Feed */}
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
                <div className="border-b border-[var(--border)] pb-3">
                  <h3 className="text-sm font-bold text-[var(--text-1)] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    Key Lessons Learned
                  </h3>
                  <p className="text-xs text-[var(--text-2)]">
                    Takeaways distilled from recent retrospectives.
                  </p>
                </div>

                {pulse.lessons_learned.length === 0 ? (
                  <p className="text-xs text-[var(--text-2)] py-4">No lessons logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {pulse.lessons_learned.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-2)]">
                          <span className="truncate max-w-[170px]">{item.opportunity_title}</span>
                          <span className={cn(
                            "font-bold uppercase",
                            item.outcome === 'won' ? "text-emerald-400" : "text-rose-400"
                          )}>{item.outcome}</span>
                        </div>
                        <p className="text-[var(--text-1)] font-medium leading-relaxed">
                          "{item.lesson}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RETROSPECTIVES TIMELINE */}
          {activeTab === 'retrospectives' && (
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
              <div className="border-b border-[var(--border)] pb-3">
                <h2 className="text-base font-bold text-[var(--text-1)]">
                  Post-Pursuit Retrospectives Log
                </h2>
                <p className="text-xs text-[var(--text-2)]">
                  Detailed post-mortems capturing winning presentation factors and competitor intelligence.
                </p>
              </div>

              {pulse.recent_retrospectives.length === 0 ? (
                <p className="text-xs text-[var(--text-2)] py-6 text-center">No retrospectives logged yet.</p>
              ) : (
                <div className="space-y-4">
                  {pulse.recent_retrospectives.map((retro) => (
                    <div key={retro.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <Badge className={cn(
                            "text-[10px] uppercase font-bold",
                            retro.outcome === 'won' ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            {retro.outcome}
                          </Badge>
                          <span className="text-sm font-bold text-[var(--text-1)]">{retro.opportunity_title}</span>
                        </div>
                        <span className="text-xs text-[var(--text-2)]">
                          {retro.created_at ? new Date(retro.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="md:col-span-2 space-y-1.5">
                          <p className="text-[var(--text-1)]">
                            <span className="font-semibold text-[var(--text-2)]">Analysis: </span>
                            {retro.detailed_retrospective || 'No narrative provided.'}
                          </p>
                          {retro.lessons_learned?.length > 0 && (
                            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)] text-[11px]">
                              <span className="font-semibold text-[var(--text-1)]">Takeaway: </span>
                              {retro.lessons_learned[0]}
                            </div>
                          )}
                        </div>

                        <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-2)] space-y-1">
                          <p><span className="font-semibold text-[var(--text-1)]">Buyer:</span> {retro.buyer}</p>
                          {retro.award_value && (
                            <p><span className="font-semibold text-[var(--text-1)]">Award Value:</span> {formatCurrency(retro.award_value)}</p>
                          )}
                          {retro.winner_name && (
                            <p><span className="font-semibold text-[var(--text-1)]">Winner:</span> {retro.winner_name}</p>
                          )}
                          <p><span className="font-semibold text-[var(--text-1)]">Root Driver:</span> <span className="capitalize">{retro.primary_reason_category?.replace('_', ' ')}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REUSABLE ARTIFACTS */}
          {activeTab === 'artifacts' && (
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
              <div className="border-b border-[var(--border)] pb-3">
                <h2 className="text-base font-bold text-[var(--text-1)] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  Reusable Proposal Section Repository
                </h2>
                <p className="text-xs text-[var(--text-2)]">
                  Proven architecture diagrams, executive summaries, and compliance responses saved for future pursuits.
                </p>
              </div>

              {pulse.reusable_artifacts.length === 0 ? (
                <p className="text-xs text-[var(--text-2)] py-6 text-center">No proposal artifacts indexed yet. Record winning outcomes to build the repository.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {pulse.reusable_artifacts.map((art, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] space-y-2">
                      <div className="flex items-center gap-2 text-blue-400">
                        <FileText className="h-4 w-4" />
                        <h4 className="text-xs font-bold text-[var(--text-1)] truncate">{art.title}</h4>
                      </div>
                      <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
                        {art.summary}
                      </p>
                      <div className="pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs h-7"
                          onClick={() => router.push('/workspace/evidence')}
                        >
                          View in Evidence Vault <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* RECORD OUTCOME MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-1)] flex items-center gap-2">
                <Trophy className="h-4 w-4 text-purple-400" />
                Record Post-Pursuit Outcome & Retrospective
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[var(--text-2)] hover:text-[var(--text-1)] text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Opportunity Select */}
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-2)]">Opportunity</label>
                <select
                  value={oppId}
                  onChange={(e) => setOppId(e.target.value)}
                  required
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                >
                  <option value="">Select an opportunity...</option>
                  {opportunities.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.title.slice(0, 70)} ({o.organization_name || 'Buyer'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Outcome choice & Award Value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-2)]">Outcome</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as any)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  >
                    <option value="won">Won (Awarded)</option>
                    <option value="lost">Lost</option>
                    <option value="disqualified">Disqualified (Hurdle Failed)</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-2)]">Award Value (INR)</label>
                  <input
                    type="number"
                    value={awardValue}
                    onChange={(e) => setAwardValue(e.target.value)}
                    placeholder="10000000"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Primary Reason & Winner */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-2)]">Primary Root Driver</label>
                  <select
                    value={reasonCat}
                    onChange={(e) => setReasonCat(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  >
                    <option value="technical_score">Technical Architecture & Solution Score</option>
                    <option value="pricing_commercial">Aggressive Competitor Pricing (L1)</option>
                    <option value="certification_gap">Mandatory Certification Defect</option>
                    <option value="past_experience">Past Similar Track Record / Value</option>
                    <option value="compliance_defect">RFP Tender Checklist Defect</option>
                    <option value="delivery_capacity">Team Bandwidth & Regional Deployment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-2)]">Winning Bidder (Optional)</label>
                  <input
                    type="text"
                    value={winnerName}
                    onChange={(e) => setWinnerName(e.target.value)}
                    placeholder="Competitor Name"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Detailed Retrospective */}
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-2)]">Detailed Retrospective</label>
                <textarea
                  rows={2}
                  value={retrospective}
                  onChange={(e) => setRetrospective(e.target.value)}
                  placeholder="What went well? What caused the win or loss?"
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl p-3 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Lessons Learned */}
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-2)]">Actionable Lessons Learned (One per line)</label>
                <textarea
                  rows={2}
                  value={lessons}
                  onChange={(e) => setLessons(e.target.value)}
                  placeholder="Future bids in this domain should include..."
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl p-3 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Reusable Artifact */}
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-2)]">Reusable Proposal Section Title (Optional)</label>
                <input
                  type="text"
                  value={artifactTitle}
                  onChange={(e) => setArtifactTitle(e.target.value)}
                  placeholder="e.g. Edge Video Stream High-Availability Architecture"
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={recordMutation.isPending}>
                  {recordMutation.isPending ? "Recording..." : "Save Retrospective"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
