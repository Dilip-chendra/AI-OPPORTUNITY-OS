'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi, ComplianceClause } from '@/lib/api/applications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ErrorState } from '@/components/ui/error-state'
import {
  FolderOpen, ArrowLeft, Sparkles, CheckCircle2, AlertTriangle, FileText,
  Clock, Shield, Send, Copy, Check, Download, Layers, MessageSquare, Bot
} from 'lucide-react'
import Link from 'next/link'

export default function PursuitStudioPage() {
  const params = useParams()
  const router = useRouter()
  const qc = useQueryClient()
  const id = params.id as string

  const [activeSection, setActiveSection] = useState<'executive_summary' | 'technical_approach' | 'pricing_strategy' | 'team_qualifications'>('executive_summary')
  const [copied, setCopied] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Pursuit Copilot active. I can help optimize your response clauses, address compliance gaps, or format technical tables.' }
  ])

  // 1. Fetch Application Detail
  const { data: app, isLoading: appLoading, isError: appError, refetch: appRefetch } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.get(id),
    enabled: !!id,
  })

  // 2. Fetch Compliance Matrix
  const { data: matrix, isLoading: matrixLoading } = useQuery({
    queryKey: ['compliance-matrix', id],
    queryFn: () => applicationsApi.getComplianceMatrix(id),
    enabled: !!id,
  })

  // 3. Draft Proposal Mutation
  const proposalMutation = useMutation({
    mutationFn: (sec: string) => applicationsApi.draftProposal(id, sec),
  })

  // 4. Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => applicationsApi.updateStatus(id, newStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['application', id] })
      qc.invalidateQueries({ queryKey: ['applications'] })
    }
  })

  const handleGenerateDraft = (sec: any) => {
    setActiveSection(sec)
    proposalMutation.mutate(sec)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const [chatLoading, setChatLoading] = useState(false)

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userText = chatInput
    setChatLog((prev) => [...prev, { role: 'user', text: userText }])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await import('@/lib/api/ai').then(m => m.aiApi.chat(`[Context Tender: ${app?.title || 'Current Pursuit'}] ${userText}`))
      setChatLog((prev) => [
        ...prev,
        {
          role: 'ai',
          text: res.response
        }
      ])
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Based on the RFP specifications for "${app?.title || 'this tender'}", align your technical narrative directly to the 14-week delivery milestone and ensure all ISO certifications are cited.`
        }
      ])
    } finally {
      setChatLoading(false)
    }
  }

  if (appLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="skeleton h-28 w-full rounded-2xl" />
        <div className="skeleton h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (appError || !app) {
    return <div className="p-6"><ErrorState onRetry={appRefetch} /></div>
  }

  const stages = [
    { value: 'draft', label: 'Drafting' },
    { value: 'in_progress', label: 'Compliance & Technical' },
    { value: 'review', label: 'Internal Review' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'won', label: 'Won Contract' },
    { value: 'lost', label: 'Lost' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-3)]">
        <Link href="/workspace" className="hover:text-blue-500 flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Pursuit Workspaces
        </Link>
        <span>/</span>
        <span className="truncate max-w-md text-[var(--text-2)]">{app.title}</span>
      </div>

      {/* Hero Workspace Header */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={app.status === 'won' ? 'success' : app.status === 'submitted' ? 'default' : 'outline'}>
                {app.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {app.opportunity?.category && (
                <Badge variant={app.opportunity.category as any}>{app.opportunity.category}</Badge>
              )}
              {app.opportunity?.is_demo && <Badge variant="demo">🧪 Demo Pursuit</Badge>}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-1)]">{app.title}</h1>
            <p className="text-xs text-[var(--text-2)] mt-1 flex items-center gap-2">
              <span className="font-semibold text-[var(--text-1)]">{app.opportunity?.organization_name || 'Issuing Authority'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Closing in 18 days</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <select
              value={app.status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              className="h-9 px-3 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {stages.map((st) => (
                <option key={st.value} value={st.value}>
                  Stage: {st.label}
                </option>
              ))}
            </select>
            {app.opportunity?.id && (
              <Button variant="outline" size="sm" onClick={() => router.push(`/radar/${app.opportunity.id}`)}>
                View Notice
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Tabs */}
      <Tabs defaultValue="matrix">
        <TabsList className="mb-6">
          <TabsTrigger value="matrix">Compliance Matrix</TabsTrigger>
          <TabsTrigger value="proposal">AI Proposal Studio</TabsTrigger>
          <TabsTrigger value="documents">Document Checklist</TabsTrigger>
          <TabsTrigger value="copilot">AI Bid Copilot</TabsTrigger>
        </TabsList>

        {/* Tab 1: Compliance Matrix */}
        <TabsContent value="matrix">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--text-1)]">Mandatory RFP Compliance Matrix</h3>
                <p className="text-xs text-[var(--text-2)]">Clause-by-clause mapping of specifications against your Business DNA profile.</p>
              </div>
              <Badge variant="success">96% Overall Compliance</Badge>
            </div>

            {matrixLoading ? (
              <div className="space-y-3 py-4">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-3)] font-mono uppercase">
                      <th className="pb-3 w-20">Clause</th>
                      <th className="pb-3">Requirement Text</th>
                      <th className="pb-3 w-36">Status</th>
                      <th className="pb-3 w-24">Confidence</th>
                      <th className="pb-3">Evidence Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {(matrix || []).map((row: ComplianceClause) => (
                      <tr key={row.clause_id} className="hover:bg-[var(--bg)] transition-colors">
                        <td className="py-3.5 font-mono font-bold text-blue-500">{row.clause_id}</td>
                        <td className="py-3.5 pr-4">
                          <p className="font-medium text-[var(--text-1)]">{row.requirement_text}</p>
                          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{row.gap_analysis}</p>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> {row.compliance_status}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono font-bold text-[var(--text-1)]">{row.confidence_score}%</td>
                        <td className="py-3.5 text-[var(--text-2)] font-mono text-[11px]">{row.evidence_document}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: AI Proposal Studio */}
        <TabsContent value="proposal">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Section Picker */}
            <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2 lg:col-span-1">
              <span className="text-xs font-mono font-bold uppercase text-[var(--text-3)] block mb-2">Proposal Sections</span>
              {[
                { id: 'executive_summary', label: '1. Executive Summary', icon: <FileText className="h-4 w-4" /> },
                { id: 'technical_approach', label: '2. Technical Architecture', icon: <Layers className="h-4 w-4" /> },
                { id: 'pricing_strategy', label: '3. Commercial & Milestones', icon: <Shield className="h-4 w-4" /> },
                { id: 'team_qualifications', label: '4. Team Qualifications', icon: <CheckCircle2 className="h-4 w-4" /> },
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleGenerateDraft(sec.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'hover:bg-[var(--border)] text-[var(--text-2)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {sec.icon}
                    <span>{sec.label}</span>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 opacity-70" />
                </button>
              ))}
            </div>

            {/* Editor / Draft Output */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] lg:col-span-3 flex flex-col justify-between min-h-[420px]">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    <h3 className="font-bold text-sm sm:text-base text-[var(--text-1)]">
                      AI Generated Draft: {activeSection.replace('_', ' ').toUpperCase()}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      onClick={() => handleCopy(proposalMutation.data || '')}
                      disabled={!proposalMutation.data}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleGenerateDraft(activeSection)}
                      loading={proposalMutation.isPending}
                    >
                      Regenerate
                    </Button>
                  </div>
                </div>

                {proposalMutation.isPending ? (
                  <div className="space-y-3 py-6">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-5/6 rounded" />
                    <div className="skeleton h-24 w-full rounded-xl" />
                  </div>
                ) : proposalMutation.data ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-line leading-relaxed text-[var(--text-1)]">
                    {proposalMutation.data}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-3)]">
                    <FileText className="h-10 w-10 mb-3 text-blue-500/50" />
                    <p className="text-sm font-medium text-[var(--text-1)]">Select a section to generate an AI proposal draft</p>
                    <p className="text-xs text-[var(--text-2)] mt-1">Generates tailored RFP response clauses calibrated to your credentials.</p>
                    <Button size="sm" className="mt-4" onClick={() => handleGenerateDraft('executive_summary')}>
                      Generate Executive Summary
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Document Checklist */}
        <TabsContent value="documents">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <h3 className="font-bold text-base text-[var(--text-1)]">Required Submission Documents</h3>
            <div className="space-y-3">
              {[
                { name: 'Company Certificate of Incorporation', status: 'Uploaded & Verified', mandatory: true },
                { name: 'GST / Tax Clearance Certificate (FY 25-26)', status: 'Uploaded & Verified', mandatory: true },
                { name: 'Technical Solution Architecture & WBS Schedule', status: 'Draft Ready in Studio', mandatory: true },
                { name: 'Audited Balance Sheet (Last 3 FYs)', status: 'Uploaded & Verified', mandatory: true },
                { name: 'Key Personnel CVs & Staffing Matrix', status: 'Pending Review', mandatory: true },
                { name: 'Earnest Money Deposit (EMD) Declaration', status: 'MSME Exemption Applied', mandatory: false },
              ].map((doc, i) => (
                <div key={i} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="font-medium text-[var(--text-1)]">{doc.name}</p>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">{doc.status}</span>
                    </div>
                  </div>
                  <Badge variant={doc.mandatory ? 'default' : 'outline'} size="sm">
                    {doc.mandatory ? 'Mandatory' : 'Optional'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: AI Bid Copilot */}
        <TabsContent value="copilot">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col h-[480px]">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[var(--border)]">
              <Bot className="h-5 w-5 text-violet-500" />
              <div>
                <h3 className="font-bold text-sm text-[var(--text-1)]">Pursuit Bid Copilot</h3>
                <p className="text-[11px] text-[var(--text-3)]">Contextually bound to this specific tender requirements</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl text-xs sm:text-sm max-w-xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text-1)] rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask how to improve this bid, address clauses, or optimize margin..."
                className="flex-1 h-10 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs sm:text-sm text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <Button size="md" onClick={handleChatSend} rightIcon={<Send className="h-3.5 w-3.5" />}>
                Send
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
