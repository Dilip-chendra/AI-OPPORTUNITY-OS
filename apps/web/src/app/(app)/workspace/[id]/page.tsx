'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { applicationsApi } from '@/lib/api/applications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import {
  ArrowLeft, Clock, CheckSquare, FileText, ShieldCheck,
  Calendar, RefreshCw, CheckCircle2, Circle, ChevronRight,
  Zap, Award, Target
} from 'lucide-react'
import { api } from '@/lib/api/client'

const TABS = [
  { key: 'overview', label: 'Overview', icon: <Target className="h-3.5 w-3.5" /> },
  { key: 'compliance', label: 'Compliance', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  { key: 'shredder', label: 'Req. Shredder', icon: <Zap className="h-3.5 w-3.5" /> },
  { key: 'deadline', label: 'Deadline Plan', icon: <Calendar className="h-3.5 w-3.5" /> },
  { key: 'checklist', label: 'Checklist', icon: <CheckSquare className="h-3.5 w-3.5" /> },
  { key: 'proposal', label: 'AI Proposal', icon: <FileText className="h-3.5 w-3.5" /> },
]

const STATUS_OPTIONS = ['draft', 'in_progress', 'review', 'submitted', 'won', 'lost', 'withdrawn']
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  submitted: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  won: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  lost: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  withdrawn: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
}

export default function WorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [rfpText, setRfpText] = useState('')
  const [proposalSection, setProposalSection] = useState('executive_summary')
  const [proposalContent, setProposalContent] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.get(id),
  })

  const { data: complianceData, refetch: refetchCompliance } = useQuery({
    queryKey: ['compliance', id],
    queryFn: () => applicationsApi.getComplianceMatrix(id),
    enabled: activeTab === 'compliance',
  })

  const { data: deadlineData, isLoading: deadlineLoading } = useQuery({
    queryKey: ['deadline-plan', id],
    queryFn: () => api.get(`/applications/${id}/deadline-plan`).then((r: any) => r.data),
    enabled: activeTab === 'deadline',
  })

  const { data: checklistData, isLoading: checklistLoading } = useQuery({
    queryKey: ['checklist', id],
    queryFn: () => api.get(`/applications/${id}/checklist`).then((r: any) => r.data),
    enabled: activeTab === 'checklist',
  })

  const extractMutation = useMutation({
    mutationFn: () => api.post('/shredder/extract', {
      opportunity_id: (app as any)?.opportunity_id,
      text: rfpText || undefined,
    }).then((r: any) => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => applicationsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['application', id] }),
  })

  const toggleChecklistMutation = useMutation({
    mutationFn: ({ index, done }: { index: number; done: boolean }) =>
      api.patch(`/applications/${id}/checklist/${index}`, { done }).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', id] }),
  })

  const regeneratePlanMutation = useMutation({
    mutationFn: () => api.post(`/applications/${id}/deadline-plan/regenerate`).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deadline-plan', id] }),
  })

  const draftProposal = async () => {
    setAiLoading(true)
    try {
      const res = await api.post(`/applications/${id}/draft-proposal`, { section_type: proposalSection })
      setProposalContent((res.data as any).content)
    } catch {
      setProposalContent('Could not generate proposal. Please ensure your Business DNA profile is complete.')
    } finally {
      setAiLoading(false)
    }
  }

  if (isLoading) return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="skeleton h-10 w-48 rounded-xl" />
      <div className="skeleton h-96 w-full rounded-2xl" />
    </div>
  )

  if (!app) return (
    <div className="p-6">
      <EmptyState title="Application not found" description="This workspace doesn't exist or you don't have access." />
    </div>
  )

  const opp = (app as any).opportunity
  const checklist: any[] = checklistData?.checklist || []
  const plan: any[] = deadlineData?.plan || []

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm mb-3 text-[var(--text-3)]">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-1)]">{(app as any).title}</h1>
            {opp && <p className="text-sm text-[var(--text-2)]">{opp.organization_name}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={(app as any).status}
              onChange={e => statusMutation.mutate(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${STATUS_COLORS[(app as any).status] || ''}`}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            {(app as any).deadline && (
              <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-2)]">
                <Clock className="h-3.5 w-3.5" />
                {new Date((app as any).deadline).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {opp && (
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Opportunity</h3>
              <p className="text-sm text-[var(--text-2)]">{opp.description?.slice(0, 600)}{opp.description?.length > 600 ? '...' : ''}</p>
              <div className="flex flex-wrap gap-2">
                {opp.category && <Badge variant="outline">{opp.category}</Badge>}
                {opp.geography_country && <Badge variant="outline">{opp.geography_country}</Badge>}
                {opp.value_display && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{opp.value_display}</Badge>}
              </div>
              {opp.source_url && (
                <a href={opp.source_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                  View Source <ChevronRight className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Status', val: (app as any).status?.replace('_', ' ') || '—' },
              { label: 'Outcome', val: (app as any).outcome || 'Pending' },
              { label: 'Deadline', val: (app as any).deadline ? new Date((app as any).deadline).toLocaleDateString() : '—' },
              { label: 'Started', val: (app as any).created_at ? new Date((app as any).created_at).toLocaleDateString() : '—' },
            ].map(({ label, val }) => (
              <div key={label} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <p className="text-xs text-[var(--text-3)] mb-1">{label}</p>
                <p className="font-bold text-sm text-[var(--text-1)] capitalize">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance */}
      {activeTab === 'compliance' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-1)]">Compliance Matrix</h3>
            <Button size="sm" variant="outline" onClick={() => refetchCompliance()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />Refresh
            </Button>
          </div>
          {!complianceData
            ? <div className="skeleton h-48 rounded-xl" />
            : (complianceData.matrix || []).length === 0
              ? <EmptyState title="No requirements found" description="Check the opportunity has detailed requirements, or use the Requirement Shredder to extract them." />
              : (complianceData.matrix || []).map((item: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-[var(--text-1)] flex-1">{item.requirement}</p>
                    <Badge className={`text-[10px] shrink-0 ${
                      item.compliance_level === 'compliant' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      item.compliance_level === 'gap' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>{item.compliance_level || 'pending'}</Badge>
                  </div>
                  {item.action_needed && <p className="text-xs mt-2 text-[var(--text-3)]">→ {item.action_needed}</p>}
                </div>
              ))
          }
        </div>
      )}

      {/* Requirement Shredder */}
      {activeTab === 'shredder' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[var(--text-1)]">Requirement Shredder</h3>
          <p className="text-xs text-[var(--text-2)]">Paste raw RFP text to extract structured requirements, or leave blank to auto-extract from the opportunity.</p>
          <textarea
            rows={5} value={rfpText} onChange={e => setRfpText(e.target.value)}
            placeholder="Paste full RFP text here..."
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text-1)] resize-y"
          />
          <Button onClick={() => extractMutation.mutate()} disabled={extractMutation.isPending}>
            <Zap className="h-4 w-4 mr-2" />{extractMutation.isPending ? 'Extracting...' : 'Shred Requirements'}
          </Button>
          {extractMutation.data?.requirements?.map((req: any) => (
            <div key={req.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-blue-400">{req.id}</span>
                <Badge variant="outline" className="text-[10px] capitalize">{req.category}</Badge>
                {req.mandatory && <Badge className="text-[10px] bg-rose-500/20 text-rose-400 border-rose-500/30">Mandatory</Badge>}
              </div>
              <p className="text-sm text-[var(--text-1)]">{req.requirement_text}</p>
              {req.evidence_needed && <p className="text-xs mt-1 text-amber-400">Evidence: {req.evidence_needed}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Deadline Plan */}
      {activeTab === 'deadline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-1)]">Deadline Autopilot</h3>
            <Button size="sm" variant="outline" onClick={() => regeneratePlanMutation.mutate()} disabled={regeneratePlanMutation.isPending}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />Regenerate
            </Button>
          </div>
          {deadlineLoading
            ? <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
            : plan.length === 0
              ? <EmptyState title="No plan yet" description="Click Regenerate to auto-generate your pursuit execution timeline." />
              : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
                  <div className="space-y-3 pl-10">
                    {plan.map((item: any, i: number) => {
                      const overdue = item.status === 'overdue'
                      return (
                        <div key={i} className={`relative p-4 rounded-xl border ${overdue ? 'border-rose-500/30 bg-rose-500/5' : 'border-[var(--border)] bg-[var(--surface)]'}`}>
                          <div className={`absolute -left-[30px] top-4 h-3 w-3 rounded-full border-2 ${overdue ? 'border-rose-400 bg-rose-400' : 'border-blue-400 bg-[var(--bg)]'}`} />
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm text-[var(--text-1)]">{item.milestone}</p>
                              <p className="text-xs text-[var(--text-2)] mt-0.5">{item.description}</p>
                            </div>
                            <p className="text-xs font-mono text-[var(--text-3)] shrink-0">{item.due_date}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
          }
        </div>
      )}

      {/* Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-1)]">Submission Checklist</h3>
            <span className="text-xs text-[var(--text-3)]">{checklist.filter((c: any) => c.done).length}/{checklist.length} done</span>
          </div>
          {checklistLoading
            ? <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
            : checklist.map((item: any, i: number) => (
              <button key={i} onClick={() => toggleChecklistMutation.mutate({ index: i, done: !item.done })}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                  item.done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/40'
                }`}>
                {item.done
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  : <Circle className="h-4 w-4 text-[var(--text-3)] shrink-0" />}
                <span className={`text-sm ${item.done ? 'line-through text-[var(--text-3)]' : 'text-[var(--text-1)]'}`}>{item.task}</span>
              </button>
            ))
          }
        </div>
      )}

      {/* AI Proposal */}
      {activeTab === 'proposal' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select value={proposalSection} onChange={e => setProposalSection(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text-1)]">
              {[
                ['executive_summary', 'Executive Summary'],
                ['technical_approach', 'Technical Approach'],
                ['team_profile', 'Team Profile'],
                ['commercial', 'Commercial Proposal'],
                ['compliance_statement', 'Compliance Statement'],
              ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <Button onClick={draftProposal} disabled={aiLoading} leftIcon={<Award className="h-4 w-4" />}>
              {aiLoading ? 'Drafting...' : 'Draft Section'}
            </Button>
          </div>
          {proposalContent ? (
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-[var(--text-1)] capitalize">{proposalSection.replace(/_/g, ' ')}</h3>
                <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(proposalContent)}>Copy</Button>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-[var(--text-2)]">{proposalContent}</pre>
            </div>
          ) : (
            <EmptyState title="No draft yet" description="Select a section and click Draft Section to generate AI-assisted content based on your Business DNA." />
          )}
        </div>
      )}
    </div>
  )
}
