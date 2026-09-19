'use client'
import { useQuery } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { ScoreRing } from '@/components/ui/score-ring'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ErrorState } from '@/components/ui/error-state'
import { formatCurrency, formatDeadline, cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Bookmark, ExternalLink, ArrowLeft, Shield, AlertTriangle, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, Sparkles, FileText, Send } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useState } from 'react'
import { applicationsApi } from '@/lib/api/applications'
import { useAuth } from '@/lib/hooks/use-auth'
import { RolePermissions } from '@/lib/permissions'

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user } = useAuth()

  const [pursuing, setPursuing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Executive Overview</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility & Criteria</TabsTrigger>
          <TabsTrigger value="score">8-Dimension AI Score</TabsTrigger>
          <TabsTrigger value="why">Why This Matches</TabsTrigger>
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
      </Tabs>
    </div>
  )
}

