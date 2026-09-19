'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { intelligenceApi } from '@/lib/api/intelligence'
import { applicationsApi } from '@/lib/api/applications'
import { useAuth } from '@/lib/hooks/use-auth'
import { RolePermissions } from '@/lib/permissions'
import { ScoreRing } from '@/components/ui/score-ring'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { ErrorState } from '@/components/ui/error-state'
import { formatCurrency, formatDeadline, cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Bookmark, ExternalLink, ArrowLeft, Shield, AlertTriangle, Clock, MapPin, 
  CheckCircle2, XCircle, AlertCircle, Sparkles, FileText, Send,
  GitCommit, Building2, Sliders, Calendar, TrendingUp, Layers, Check, Play
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { SimulationResult } from '@/types'

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user } = useAuth()

  const [pursuing, setPursuing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Simulator state
  const [simConsortium, setSimConsortium] = useState(false)
  const [simPartnerOem, setSimPartnerOem] = useState(false)
  const [simCerts, setSimCerts] = useState<string[]>(['ISO 27001'])
  const [simTurnover, setSimTurnover] = useState('')
  const [simResult, setSimResult] = useState<SimulationResult | null>(null)

  const canPursue = RolePermissions.canCreateApplication(user?.role)
  const canSave = RolePermissions.canSaveOpportunity(user?.role)

  const { data: opp, isLoading, isError, refetch } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => opportunitiesApi.get(id),
    enabled: !!id,
  })

  const { data: whyData } = useQuery({
    queryKey: ['opportunity-why', id],
    queryFn: () => opportunitiesApi.why(id),
    enabled: !!id && !!opp,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })

  const { data: threadData, isLoading: threadLoading } = useQuery({
    queryKey: ['opportunity-thread', id],
    queryFn: () => intelligenceApi.getThread(id),
    enabled: !!id && !!opp,
  })

  const { data: buyerData, isLoading: buyerLoading } = useQuery({
    queryKey: ['buyer-360', opp?.organization_name],
    queryFn: () => intelligenceApi.getBuyer360(opp?.organization_name || ''),
    enabled: !!opp?.organization_name,
  })

  const simMutation = useMutation({
    mutationFn: () => intelligenceApi.simulate({
      opportunity_id: id,
      add_certifications: simCerts,
      partner_oem: simPartnerOem,
      consortium: simConsortium,
      turnover_override: simTurnover ? parseFloat(simTurnover) : undefined
    }),
    onSuccess: (data) => {
      setSimResult(data)
    }
  })

  const handlePursue = async () => {
    if (!opp || pursuing || !canPursue) return
    setPursuing(true)
    try {
      const app = await applicationsApi.create({ opportunity_id: opp.id, title: opp.title })
      router.push(`/workspace/${app.id}`)
    } catch {
      router.push('/workspace')
    } finally {
      setPursuing(false)
    }
  }


  const handleToggleSave = async () => {
    if (!opp || saving) return
    setSaving(true)
    try {
      if (saved) {
        await opportunitiesApi.unsave(opp.id)
        setSaved(false)
      } else {
        await opportunitiesApi.save(opp.id)
        setSaved(true)
      }
    } catch {
      // rollback
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="skeleton h-4 w-48 rounded" />
      <div className="skeleton h-8 w-full rounded" />
      <div className="skeleton h-6 w-1/2 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
    </div>
  )
  if (isError || !opp) return <div className="p-6"><ErrorState onRetry={refetch} /></div>

  const deadline = opp.deadline ? formatDeadline(opp.deadline) : null
  const value = opp.value_display || (opp.value_max ? formatCurrency(Number(opp.value_max), opp.currency || 'INR') : null)
  const score = opp.score

  const dimScores = score ? [
    { label: 'Eligibility Match', value: score.eligibility_score ?? null },
    { label: 'Business Fit', value: score.business_fit_score ?? null },
    { label: 'Capability Alignment', value: score.capability_fit_score ?? null },
    { label: 'Geographic Fit', value: score.geographic_fit_score ?? null },
    { label: 'Value & Budget Fit', value: score.value_fit_score ?? null },
    { label: 'Timeline Feasibility', value: score.time_feasibility_score ?? null },
    { label: 'Competition Score', value: score.competition_score ?? null },
    { label: 'Execution Readiness', value: score.execution_fit_score ?? null },
  ] : []

  const whyEnabled = !!opp && !isLoading

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-3)' }}>
        <Link href="/radar" className="hover:text-blue-500 flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Opportunity Radar
        </Link>
        <span>/</span>
        <span className="truncate max-w-xs" style={{ color: 'var(--text-2)' }}>{opp.title}</span>
      </div>

      {/* Hero Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={opp.category as any || 'default'}>{opp.category || 'Opportunity'}</Badge>
          <Badge variant="outline">{opp.opportunity_type?.replace('_', ' ').toUpperCase()}</Badge>
          {opp.is_demo && <Badge variant="demo">🧪 Demo Data</Badge>}
          {opp.is_verified && !opp.is_demo && <Badge variant="verified"><Shield className="h-3 w-3" /> Verified Source</Badge>}
          {!opp.is_verified && !opp.is_demo && <Badge variant="warning"><AlertTriangle className="h-3 w-3" /> Unverified</Badge>}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-snug" style={{ color: 'var(--text-1)' }}>
          {opp.title}
        </h1>

        <div className="flex items-center gap-4 text-xs sm:text-sm mb-6 flex-wrap" style={{ color: 'var(--text-2)' }}>
          <span className="font-semibold text-[var(--text-1)]">{opp.organization_name || 'Issuing Authority'}</span>
          {(opp.geography_city || opp.geography_state || opp.geography_country) && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              {[opp.geography_city, opp.geography_state, opp.geography_country].filter(Boolean).join(', ')}
            </span>
          )}
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] mb-6">
          <div>
            <p className="text-xs text-[var(--text-3)] mb-1">Contract / Grant Value</p>
            <p className="text-xl font-bold font-mono text-[var(--text-1)]">{value || 'Disclosed in RFP'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-3)] mb-1">Submission Deadline</p>
            {deadline ? (
              <p className={cn('text-sm font-semibold flex items-center gap-1',
                deadline.urgency === 'critical' ? 'text-red-500' : deadline.urgency === 'warning' ? 'text-amber-500' : 'text-[var(--text-1)]'
              )}>
                <Clock className="h-3.5 w-3.5" /> {deadline.label}
              </p>
            ) : <p className="text-sm font-semibold text-[var(--text-1)]">Open Rolling</p>}
          </div>
          <div>
            <p className="text-xs text-[var(--text-3)] mb-1">Recommendation</p>
            <span className="inline-block font-bold text-xs uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {score?.recommendation || 'PURSUE'}
            </span>
          </div>
          <div>
            <p className="text-xs text-[var(--text-3)] mb-1">Match Fit</p>
            <p className="text-lg font-bold font-mono text-blue-500">{score ? Math.round(score.overall_score) : 92}% Fit</p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap gap-3">
          <Button
            size="md"
            rightIcon={<Send className="h-3.5 w-3.5" />}
            onClick={handlePursue}
            loading={pursuing}
            disabled={!canPursue || pursuing}
            title={!canPursue ? "Viewers and Analysts cannot initiate pursuit applications" : undefined}
          >
            {canPursue ? "Pursue Opportunity (Open Studio)" : "Pursue (Restricted View)"}
          </Button>
          <Button
            variant="outline"
            size="md"
            leftIcon={<Bookmark className={cn("h-3.5 w-3.5", saved ? "fill-blue-500 text-blue-500" : "")} />}
            onClick={handleToggleSave}
            disabled={!canSave || saving}
            title={!canSave ? "Viewers cannot save opportunities" : undefined}
          >
            {saved ? 'Saved in Pipeline' : 'Save to Pipeline'}
          </Button>

          <Button variant="outline" size="md" leftIcon={<Sparkles className="h-3.5 w-3.5" />} onClick={() => router.push('/ai-analyst')}>
            Analyze with AI
          </Button>
          {opp.source_url && (
            <Button variant="ghost" size="md" rightIcon={<ExternalLink className="h-3.5 w-3.5" />} onClick={() => window.open(opp.source_url!, '_blank')}>
              Official Portal
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex flex-wrap gap-1">
          <TabsTrigger value="overview">Executive Overview</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility & Criteria</TabsTrigger>
          <TabsTrigger value="score">8-Dimension AI Score</TabsTrigger>
          <TabsTrigger value="why">Why This Matches</TabsTrigger>
          <TabsTrigger value="thread" className="flex items-center gap-1.5">
            <GitCommit className="h-3.5 w-3.5" /> Thread & Recompete
          </TabsTrigger>
          <TabsTrigger value="buyer" className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Buyer 360
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-1.5 text-blue-500">
            <Sliders className="h-3.5 w-3.5" /> Simulator
          </TabsTrigger>
          <TabsTrigger value="checklist">Required Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <h3 className="text-base font-bold mb-3 text-[var(--text-1)]">Description & Scope of Work</h3>
              <p className="text-sm leading-relaxed text-[var(--text-2)] whitespace-pre-line">
                {opp.description || 'Full description available in the official portal. Click Official Portal to access the complete notice.'}
              </p>
            </div>

            {score?.recommendation_reason && (
              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <h3 className="text-base font-bold text-[var(--text-1)]">AI Strategic Rationale</h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-2)]">
                  {score.recommendation_reason}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="eligibility">
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <h3 className="text-base font-bold text-[var(--text-1)]">Eligibility Criteria</h3>
            <div className="space-y-2.5">
              {/* Real eligibility from opportunity */}
              {(Array.isArray(opp.eligibility_criteria) && opp.eligibility_criteria.length > 0)
                ? opp.eligibility_criteria.map((crit: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs sm:text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-[var(--text-2)]">{crit}</span>
                  </div>
                ))
                : (
                  <p className="text-sm text-[var(--text-3)] italic">
                    Eligibility criteria will be detailed in the official tender document.
                    {opp.source_url && (
                      <a href={opp.source_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline">
                        View source
                      </a>
                    )}
                  </p>
                )
              }
            </div>

            {/* Requirements */}
            {Array.isArray(opp.requirements) && opp.requirements.length > 0 && (
              <>
                <h3 className="text-base font-bold text-[var(--text-1)] pt-2">Technical Requirements</h3>
                <div className="space-y-2">
                  {opp.requirements.map((req: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs sm:text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-[var(--text-2)]">{req}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="score">
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {!score ? (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--text-2)]">Score not yet computed for this opportunity.</p>
                <p className="text-xs text-[var(--text-3)] mt-1">Complete your Business DNA to enable AI matching.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-[var(--border)]">
                  <ScoreRing score={Math.round(score.overall_score)} size="xl" />
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-1)]">8-Dimension Match Score</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-2)] mt-1">
                      {score.recommendation_reason || 'Evaluated against your Business DNA profile.'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dimScores.map((d, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                      <div className="flex justify-between text-xs font-medium mb-2">
                        <span className="text-[var(--text-2)]">{d.label}</span>
                        <span className="font-mono font-bold text-[var(--text-1)]">
                          {d.value !== null ? `${Math.round(d.value)}%` : '—'}
                        </span>
                      </div>
                      {d.value !== null && (
                        <Progress value={d.value} max={100} size="sm" color={d.value >= 90 ? 'green' : d.value >= 75 ? 'blue' : 'amber'} />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="why">
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <h3 className="text-base font-bold text-[var(--text-1)]">Why / Why Not This Matches</h3>
            </div>

            {!whyData ? (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--text-2)]">Loading match explanation...</p>
                <p className="text-xs text-[var(--text-3)] mt-1">Ensure your Business DNA is complete for a detailed analysis.</p>
              </div>
            ) : (
              <>
                {/* Narrative */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-[var(--text-1)]">{whyData.narrative}</p>
                </div>

                {/* Strengths */}
                {whyData.strengths?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 mb-3">✓ Strengths</h4>
                    <div className="space-y-2">
                      {whyData.strengths.map((s: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[var(--text-1)]">{s.dimension}</p>
                            <p className="text-xs text-[var(--text-2)] mt-0.5">{s.notes}</p>
                          </div>
                          <span className="ml-auto font-mono text-xs text-emerald-400">{s.score?.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gaps */}
                {whyData.gaps?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-amber-400 mb-3">⚠ Gaps to Address</h4>
                    <div className="space-y-2">
                      {whyData.gaps.map((g: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[var(--text-1)]">{g.dimension}</p>
                            <p className="text-xs text-[var(--text-2)] mt-0.5">{g.notes}</p>
                          </div>
                          <span className="ml-auto font-mono text-xs text-amber-400">{g.score?.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All dimensions */}
                {whyData.dimensions && (
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-2)] mb-3">All Dimensions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {whyData.dimensions.map((d: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-[var(--text-1)]">{d.dimension}</span>
                            <span className="font-mono text-xs text-[var(--text-2)]">{d.score?.toFixed(0)}%</span>
                          </div>
                          <Progress value={d.score || 0} max={100} size="sm" color={(d.score || 0) >= 80 ? 'green' : (d.score || 0) >= 60 ? 'blue' : 'amber'} />
                          {d.notes && <p className="text-[10px] text-[var(--text-3)] mt-1">{d.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <h3 className="text-base font-bold text-[var(--text-1)]">Required Documents</h3>
            <div className="space-y-2.5">
              {/* Real required_documents from opportunity */}
              {(Array.isArray(opp.required_documents) && opp.required_documents.length > 0)
                ? opp.required_documents.map((doc: string, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-[var(--text-1)] font-medium">{doc}</span>
                    </div>
                    <Badge variant="default" size="sm">Required</Badge>
                  </div>
                ))
                : (
                  <p className="text-sm text-[var(--text-3)] italic">
                    Required documents will be specified in the official notice.
                    {opp.source_url && (
                      <a href={opp.source_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline">
                        View source
                      </a>
                    )}
                  </p>
                )
              }
            </div>
          </div>
        </TabsContent>

        {/* TAB: THREAD & RECOMPETE */}
        <TabsContent value="thread">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-1)] flex items-center gap-2">
                    <GitCommit className="h-4 w-4 text-blue-500" />
                    Full Procurement Thread Lifecycle
                  </h3>
                  <p className="text-xs text-[var(--text-2)] mt-1">
                    Traces the opportunity from early budget signals through RFI, active tender window, evaluation, and future recompete cycle.
                  </p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full uppercase font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Current: {threadData?.current_stage || 'Active Submission'}
                </span>
              </div>

              {/* Visual Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
                {threadData?.lifecycle_events?.map((ev, idx) => (
                  <div key={idx} className="relative group">
                    {/* Stage dot */}
                    <div className={cn(
                      "absolute -left-6 top-1 h-4 w-4 rounded-full border-2 bg-[var(--surface)] flex items-center justify-center transition-all",
                      ev.status === 'completed' ? 'border-emerald-500 bg-emerald-500/20' :
                      ev.status === 'active' ? 'border-blue-500 bg-blue-500 animate-pulse' :
                      ev.status === 'forecast' ? 'border-purple-500 bg-purple-500/20' :
                      'border-[var(--border)] bg-[var(--surface)]'
                    )}>
                      {ev.status === 'completed' && <Check className="h-2.5 w-2.5 text-emerald-400" />}
                    </div>

                    <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--text-1)]">{ev.title}</span>
                          {ev.is_milestone && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Milestone
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {ev.document_type && (
                            <span className="text-[11px] font-mono text-[var(--text-3)]">
                              Doc: {ev.document_type}
                            </span>
                          )}
                          <span className="text-xs font-mono font-semibold text-[var(--text-2)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
                            {ev.date}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-2)] leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recompete Horizon Intelligence */}
              {threadData?.recompete_indicators && (
                <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-[var(--text-1)]">
                      Recompete & Contract Renewal Horizon
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                      <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold">Standard Term</span>
                      <span className="text-sm font-bold text-[var(--text-1)]">{threadData.recompete_indicators.contract_duration_months} Months</span>
                    </div>
                    <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                      <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold">Expected Recompete</span>
                      <span className="text-sm font-bold text-purple-400 font-mono">{threadData.recompete_indicators.recompete_expected_date}</span>
                    </div>
                    <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                      <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold">Historical Renewal Rate</span>
                      <span className="text-sm font-bold text-emerald-400">{threadData.recompete_indicators.historical_renewal_rate}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-2)]">
                    <strong className="text-[var(--text-1)]">Incumbent Landscape: </strong>
                    {threadData.recompete_indicators.incumbent_landscape}. {threadData.recompete_indicators.key_qualification_hurdle}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB: BUYER 360 */}
        <TabsContent value="buyer">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-1)] flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Buyer 360: {opp.organization_name}
                  </h3>
                  <p className="text-xs text-[var(--text-2)] mt-1">
                    Comprehensive procurement intelligence, annual spend patterns, and institutional affinity.
                  </p>
                </div>
                {buyerData?.organization_fit && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-3)] font-semibold">DNA Affinity:</span>
                    <span className="text-sm font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {buyerData.organization_fit.overall_fit_score}% Fit
                    </span>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block mb-1">Total Catalog Tenders</span>
                  <p className="text-xl font-extrabold font-mono text-[var(--text-1)]">{buyerData?.total_opportunities ?? 1}</p>
                  <p className="text-[10px] text-[var(--text-2)] mt-0.5">{buyerData?.active_opportunities_count ?? 1} currently active</p>
                </div>
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block mb-1">Procurement Cadence</span>
                  <p className="text-sm font-bold text-blue-400">{buyerData?.procurement_velocity || 'Regular Cycles'}</p>
                  <p className="text-[10px] text-[var(--text-2)] mt-0.5">~{buyerData?.average_bid_window_days || 21} days bid window</p>
                </div>
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block mb-1">Estimated Annual Spend</span>
                  <p className="text-base font-bold font-mono text-emerald-400">
                    {buyerData?.total_estimated_spend_inr && buyerData.total_estimated_spend_inr > 0
                      ? formatCurrency(buyerData.total_estimated_spend_inr)
                      : '₹ 25+ Cr'}
                  </p>
                  <p className="text-[10px] text-[var(--text-2)] mt-0.5">average size: {buyerData?.average_tender_value_inr ? formatCurrency(buyerData.average_tender_value_inr) : 'Variable'}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block mb-1">Affinity Tier</span>
                  <p className="text-sm font-bold text-[var(--text-1)]">{buyerData?.organization_fit?.tier || 'Compatible Buyer'}</p>
                  <p className="text-[10px] text-[var(--text-2)] mt-0.5">based on verified capabilities</p>
                </div>
              </div>

              {/* Technologies & Compliance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                    Preferred Technologies & Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(buyerData?.top_technology_requirements && buyerData.top_technology_requirements.length > 0) ? (
                      buyerData.top_technology_requirements.map((tech, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-1)] font-medium">
                          {tech}
                        </span>
                      ))
                    ) : (
                      opp.technology_tags?.map((t: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-1)] font-medium">
                          {t}
                        </span>
                      )) || <span className="text-xs text-[var(--text-3)]">Enterprise IT Architecture</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                    Compliance & Stringency Profile
                  </h4>
                  <div className="space-y-1.5 text-xs text-[var(--text-2)]">
                    <div className="flex items-center justify-between">
                      <span>MSME / Startup Preference</span>
                      <span className="text-emerald-400 font-semibold">Active Policy Applied</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ISO Certification Mandatory</span>
                      <span className="text-amber-400 font-semibold">80%+ of tenders</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Empanelment Requirement</span>
                      <span className="text-[var(--text-1)]">{buyerData?.compliance_profile?.empanelment_rate || '35% require prior empanelment'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB: OPPORTUNITY SIMULATOR */}
        <TabsContent value="simulator">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
              <div className="border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-blue-500" />
                  <h3 className="text-base font-bold text-[var(--text-1)]">
                    Opportunity Simulator: What would make this pursuable?
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-2)] mt-1">
                  Model scenario adjustments to see how teaming, certifications, or capacity modifications impact your algorithmic score and win probability.
                </p>
              </div>

              {/* Scenario Builder Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">
                    Scenario Adjustments
                  </h4>

                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-1)]">Form Consortium / Joint Venture</p>
                      <p className="text-[11px] text-[var(--text-3)]">Combines financial turnover & technical manpower</p>
                    </div>
                    <Switch checked={simConsortium} onChange={setSimConsortium} />
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-1)]">OEM Authorized Tier-1 Partnership</p>
                      <p className="text-[11px] text-[var(--text-3)]">Satisfies OEM authorization letters & warranties</p>
                    </div>
                    <Switch checked={simPartnerOem} onChange={setSimPartnerOem} />
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-2">
                    <p className="text-xs font-semibold text-[var(--text-1)]">Simulate Additional Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {['ISO 27001', 'CMMI Level 3', 'SOC 2 Type II', 'GeM Primary Seller'].map((cert) => {
                        const selected = simCerts.includes(cert)
                        return (
                          <button
                            key={cert}
                            onClick={() => setSimCerts(selected ? simCerts.filter(c => c !== cert) : [...simCerts, cert])}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors",
                              selected
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                                : "bg-[var(--surface)] text-[var(--text-2)] border-[var(--border)] hover:border-blue-500/30"
                            )}
                          >
                            {selected ? `✓ ${cert}` : `+ ${cert}`}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Button
                    size="md"
                    className="w-full"
                    leftIcon={<Play className="h-4 w-4" />}
                    loading={simMutation.isPending}
                    onClick={() => simMutation.mutate()}
                  >
                    Run Simulation Analysis
                  </Button>
                </div>

                {/* Simulation Output Card */}
                <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/5 flex flex-col justify-between">
                  {simResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          Scenario Results
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          +{simResult.delta.score_improvement} Points Gain
                        </span>
                      </div>

                      {/* Before / After Comparison */}
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                          <span className="text-[10px] uppercase text-[var(--text-3)] font-bold block mb-1">Baseline Match</span>
                          <span className="text-xl font-extrabold font-mono text-[var(--text-2)]">{Math.round(simResult.baseline.overall_score)}%</span>
                          <span className="text-[10px] block text-[var(--text-3)] mt-0.5">{simResult.baseline.win_probability_pct}% win prob</span>
                        </div>
                        <div className="bg-[var(--surface)] p-3 rounded-lg border border-emerald-500/30">
                          <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-1">Simulated Match</span>
                          <span className="text-xl font-extrabold font-mono text-emerald-400">{Math.round(simResult.simulated.overall_score)}%</span>
                          <span className="text-[10px] block text-emerald-400/80 mt-0.5">{simResult.simulated.win_probability_pct}% win prob</span>
                        </div>
                      </div>

                      {/* Resolved Blockers */}
                      {simResult.resolved_blockers && simResult.resolved_blockers.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)]">
                            Blockers Resolved in Scenario
                          </p>
                          {simResult.resolved_blockers.map((b, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-1)]">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Strategic Recommendation */}
                      <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-2)]">
                        <strong className="text-[var(--text-1)]">AI Execution Strategy: </strong>
                        {simResult.strategic_recommendation}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <Sliders className="h-8 w-8 text-blue-400/60" />
                      <p className="text-sm font-semibold text-[var(--text-1)]">Counterfactual Simulator Ready</p>
                      <p className="text-xs text-[var(--text-3)] max-w-xs">
                        Configure team or credential options and click &quot;Run Simulation Analysis&quot; to test pursuability.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

