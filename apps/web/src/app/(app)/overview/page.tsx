'use client'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/analytics'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { applicationsApi } from '@/lib/api/applications'
import { alertsApi } from '@/lib/api/alerts'
import { businessProfileApi } from '@/lib/api/business-profile'
import { intelligenceApi } from '@/lib/api/intelligence'
import { learningApi } from '@/lib/api/learning'
import { useAuth } from '@/lib/hooks/use-auth'
import { MetricCard } from '@/components/ui/metric-card'
import { OpportunityCard, CardSkeleton } from '@/components/opportunity/opportunity-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { getGreeting, timeAgo, formatCurrency, cn } from '@/lib/utils'
import { getRoleBadgeConfig, RolePermissions } from '@/lib/permissions'
import { 
  Bell, Clock, Target, TrendingUp, Shield, FolderOpen, 
  Sparkles, CheckCircle2, FileText, ArrowRight, Bot, Lock, Award,
  Fingerprint, Zap, Layers, AlertCircle, Calendar, ArrowUpRight,
  Scale, Brain
} from 'lucide-react'

export default function OverviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const role = user?.role || 'viewer'
  const roleConfig = getRoleBadgeConfig(role)

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: analyticsApi.overview,
  })

  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => opportunitiesApi.recommendations(6),
  })

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications-overview'],
    queryFn: applicationsApi.list,
  })

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.list({ page_size: 5 }),
  })

  const { data: businessContext } = useQuery({
    queryKey: ['business-context'],
    queryFn: businessProfileApi.getContext,
  })

  const { data: workQueue, isLoading: queueLoading } = useQuery({
    queryKey: ['smart-work-queue'],
    queryFn: intelligenceApi.getWorkQueue,
  })

  const { data: learningPulse } = useQuery({
    queryKey: ['learning-pulse-overview'],
    queryFn: learningApi.getPulse,
  })

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  const getRoleTagline = () => {
    switch (role) {
      case 'owner':
      case 'admin':
        return 'Executive Command — Pipeline Value, Conversion & Enterprise Signals'
      case 'manager':
        return 'Team Dispatch — Active Pursuits, Submission Deadlines & Review Pipeline'
      case 'analyst':
        return 'Intelligence Radar — High-Confidence Matches & 8-Dimension Fit Engine'
      case 'member':
        return 'Personal Workbench — Assigned Pursuits, Document Checklists & Actions'
      case 'viewer':
      default:
        return 'Portfolio Summary — Read-Only Intelligence & Performance Metrics'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Read-Only Notice for Viewer Persona */}
      {role === 'viewer' && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">👁️</span>
            <div>
              <p className="font-semibold text-[var(--text-1)]">Viewer Mode — Read-Only Portfolio Access</p>
              <p className="text-xs text-[var(--text-2)] mt-0.5">
                You have read-only access to organization opportunities, active pursuits, and pipeline analytics. Mutation operations (create pursuit, save opportunity, edit Business DNA) are restricted.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider border-blue-500/30 text-blue-400 bg-blue-500/10">
            READ-ONLY
          </span>
        </div>
      )}

      {/* Role-Aware Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
              {getGreeting()}, {firstName}.
            </h1>
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider', roleConfig.color)}>
              {roleConfig.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-[var(--text-1)]">
              {businessContext?.company_name || user?.organization_name || 'Your Enterprise'}
            </span>
            <span className="text-[10px] text-[var(--text-3)]">•</span>
            <span className="text-[11px] text-[var(--text-2)]">
              {businessContext?.industry || 'Technology & Services'}
            </span>
            <span className="text-[10px] text-[var(--text-3)]">•</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              DNA v{businessContext?.version || 1} ({businessContext?.completeness?.score || 100}% Complete)
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {businessContext?.readiness?.tier || 'Ready to Bid'}
            </span>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-2)' }}>
            {getRoleTagline()}
          </p>
        </div>

        {/* Quick Route Actions */}
        <div className="flex items-center gap-2">
          {RolePermissions.canCreateApplication(role) && (
            <Button size="sm" variant="default" onClick={() => router.push('/decision')}>
              <Scale className="h-3.5 w-3.5 mr-1" />
              Decision Center
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => router.push('/workspace')}>
            Pursuit Studio
          </Button>
          {(role === 'owner' || role === 'admin') && (
            <Button size="sm" variant="ghost" onClick={() => router.push('/business-dna')}>
              Business DNA
            </Button>
          )}
        </div>
      </div>

      {/* OPPORTUNITYOS 3.0: THE 5 NORTH STAR QUESTIONS MORNING BRIEFING */}
      <section className="p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-cyan-500/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Operating System Briefing
              </span>
              <h2 className="text-base font-bold text-[var(--text-1)]">
                The 5 Morning Briefing Questions
              </h2>
            </div>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Real-time executive answers dynamically derived from your verified Business DNA and live market signals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => router.push('/decision')}>
              <Scale className="h-3.5 w-3.5 mr-1 text-blue-400" /> Bid/No-Bid Workbench
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => router.push('/learning')}>
              <Brain className="h-3.5 w-3.5 mr-1 text-purple-400" /> Learning Pulse
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. WHAT CHANGED? */}
          <div 
            onClick={() => router.push('/alerts')}
            className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px] text-[var(--text-2)] font-semibold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Bell className="h-3.5 w-3.5" /> 1. What Changed?
              </span>
              <span className="font-mono text-cyan-400 font-bold">{alerts?.total || 0} signals</span>
            </div>
            <p className="text-xs font-bold text-[var(--text-1)]">
              {alerts?.data?.[0]?.title?.slice(0, 45) || 'No new corrigenda'}
            </p>
            <p className="text-[10px] text-[var(--text-2)]">
              Corrigenda, buyer updates & signals
            </p>
          </div>

          {/* 2. WHAT MATTERS? */}
          <div 
            onClick={() => router.push('/radar')}
            className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px] text-[var(--text-2)] font-semibold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Target className="h-3.5 w-3.5" /> 2. What Matters?
              </span>
              <span className="font-mono text-blue-400 font-bold">{recommendations?.length || 0} top</span>
            </div>
            <p className="text-xs font-bold text-[var(--text-1)]">
              {recommendations?.[0]?.score?.overall_score ? `${recommendations[0].score.overall_score}% Highest Match` : 'Hard Gates Screened'}
            </p>
            <p className="text-[10px] text-[var(--text-2)]">
              Filtered by mandatory qualifications
            </p>
          </div>

          {/* 3. WHY IT MATTERS? */}
          <div 
            onClick={() => router.push('/business-dna')}
            className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px] text-[var(--text-2)] font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Fingerprint className="h-3.5 w-3.5" /> 3. Why It Matters?
              </span>
              <span className="font-mono text-emerald-400 font-bold">DNA Match</span>
            </div>
            <p className="text-xs font-bold text-[var(--text-1)] truncate">
              {businessContext?.company_name || 'Verified DNA'}
            </p>
            <p className="text-[10px] text-[var(--text-2)]">
              Grounded in verified capabilities
            </p>
          </div>

          {/* 4. WHAT NEXT? */}
          <div 
            onClick={() => router.push('/workspace')}
            className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px] text-[var(--text-2)] font-semibold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Zap className="h-3.5 w-3.5" /> 4. What Next?
              </span>
              <span className="font-mono text-amber-400 font-bold">{workQueue?.items?.length || 0} tasks</span>
            </div>
            <p className="text-xs font-bold text-[var(--text-1)] truncate">
              {workQueue?.items?.[0]?.title?.slice(0, 38) || 'Active Work Queue'}
            </p>
            <p className="text-[10px] text-[var(--text-2)]">
              Smart dispatch & upcoming deadlines
            </p>
          </div>

          {/* 5. WHAT LEARNING? */}
          <div 
            onClick={() => router.push('/learning')}
            className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-purple-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px] text-[var(--text-2)] font-semibold">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Brain className="h-3.5 w-3.5" /> 5. What Learning?
              </span>
              <span className="font-mono text-purple-400 font-bold">{learningPulse?.win_rate_pct ?? 0}% Win</span>
            </div>
            <p className="text-xs font-bold text-[var(--text-1)] truncate">
              {learningPulse?.recurrent_blockers?.[0]?.label?.slice(0, 32) || `${learningPulse?.total_outcomes ?? 0} Outcomes Tracked`}
            </p>
            <p className="text-[10px] text-[var(--text-2)]">
              Post-mortems & repeat blockers
            </p>
          </div>
        </div>
      </section>

      {/* Role-Specific Metric Cards */}
      {/* 1. OWNER / ADMIN VIEW */}
      {(role === 'owner' || role === 'admin') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Estimated Pipeline" loading={analyticsLoading}
            value={analytics && analytics.estimated_pipeline_value > 0 ? formatCurrency(analytics.estimated_pipeline_value) : '—'}
            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
            description="total enterprise pipeline"
          />
          <MetricCard
            label="Win Probability" loading={analyticsLoading}
            value={analytics?.win_rate !== undefined && analytics.opportunities_pursued > 0 ? `${analytics.win_rate}%` : '—'}
            icon={<Award className="h-4 w-4 text-amber-500" />}
            description="historical win rate"
          />
          <MetricCard
            label="High Priority Deals" loading={analyticsLoading}
            value={analytics?.high_priority_count ?? 0}
            icon={<Target className="h-4 w-4 text-blue-500" />}
            description="scored >85% fit"
          />
          <MetricCard
            label="Critical Deadlines" loading={analyticsLoading}
            value={analytics?.deadlines_this_week ?? 0}
            icon={<Clock className="h-4 w-4 text-red-500" />}
            description="closing within 7 days"
          />
        </div>
      )}

      {/* 2. MANAGER VIEW */}
      {role === 'manager' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Active Pursuits" loading={appsLoading}
            value={applications?.length ?? 0}
            icon={<FolderOpen className="h-4 w-4 text-blue-500" />}
            description="team pipeline items"
          />
          <MetricCard
            label="In Review" loading={appsLoading}
            value={applications?.filter((a: any) => a.status === 'review').length ?? 0}
            icon={<FileText className="h-4 w-4 text-amber-500" />}
            description="awaiting approval"
          />
          <MetricCard
            label="Team Deadlines" loading={analyticsLoading}
            value={analytics?.deadlines_this_week ?? 0}
            icon={<Clock className="h-4 w-4 text-red-500" />}
            description="due this week"
          />
          <MetricCard
            label="New Qualified Signals" loading={analyticsLoading}
            value={analytics?.new_matches_this_week ?? 0}
            icon={<Target className="h-4 w-4 text-emerald-500" />}
            description="ready for dispatch"
          />
        </div>
      )}

      {/* 3. ANALYST VIEW */}
      {role === 'analyst' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Signals Cataloged" loading={analyticsLoading}
            value={analytics?.opportunities_discovered ?? 0}
            icon={<Target className="h-4 w-4 text-cyan-400" />}
            description="across 7 channels"
          />
          <MetricCard
            label="Avg Fit Confidence" loading={analyticsLoading}
            value={analytics?.average_match_score ? `${analytics.average_match_score}%` : '—'}
            icon={<Sparkles className="h-4 w-4 text-blue-500" />}
            description="8-dimension match"
          />
          <MetricCard
            label="High-Relevance" loading={analyticsLoading}
            value={analytics?.high_priority_count ?? 0}
            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
            description="pursue recommendation"
          />
          <MetricCard
            label="Verified Sources" loading={analyticsLoading}
            value={analytics?.opportunities_discovered ? '100%' : '—'}
            icon={<Shield className="h-4 w-4 text-purple-400" />}
            description="authenticated portals"
          />
        </div>
      )}

      {/* 4. MEMBER VIEW */}
      {role === 'member' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="My Assigned Pursuits" loading={appsLoading}
            value={applications?.length ?? 0}
            icon={<FolderOpen className="h-4 w-4 text-blue-500" />}
            description="in active execution"
          />
          <MetricCard
            label="Upcoming Deadlines" loading={analyticsLoading}
            value={analytics?.deadlines_this_week ?? 0}
            icon={<Clock className="h-4 w-4 text-amber-500" />}
            description="closing within 7 days"
          />
          <MetricCard
            label="Saved Opportunities" loading={analyticsLoading}
            value={analytics?.saved_count ?? 0}
            icon={<Target className="h-4 w-4 text-emerald-500" />}
            description="saved for exploration"
          />
          <MetricCard
            label="Unread Alerts" loading={alertsLoading}
            value={alerts?.data?.filter((a: any) => !a.is_read).length ?? 0}
            icon={<Bell className="h-4 w-4 text-red-500" />}
            description="new updates"
          />
        </div>
      )}

      {/* 5. VIEWER VIEW */}
      {role === 'viewer' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Discovered Signals" loading={analyticsLoading}
            value={analytics?.opportunities_discovered ?? 0}
            icon={<Target className="h-4 w-4 text-blue-500" />}
            description="organization catalog"
          />
          <MetricCard
            label="Active Pursuits" loading={appsLoading}
            value={applications?.length ?? 0}
            icon={<FolderOpen className="h-4 w-4 text-emerald-500" />}
            description="team pursuit items"
          />
          <MetricCard
            label="Pipeline Value" loading={analyticsLoading}
            value={analytics && analytics.estimated_pipeline_value > 0 ? formatCurrency(analytics.estimated_pipeline_value) : '—'}
            icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
            description="estimated total"
          />
          <MetricCard
            label="Closing Soon" loading={analyticsLoading}
            value={analytics?.deadlines_this_week ?? 0}
            icon={<Clock className="h-4 w-4 text-amber-500" />}
            description="next 7 days"
          />
        </div>
      )}

      {/* SMART WORK QUEUE — "WHAT SHOULD WE DO THIS WEEK?" */}
      <section className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--text-1)]">
                  Smart Work Queue — What Should We Do This Week?
                </h2>
                {workQueue && workQueue.critical_count > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                    {workQueue.critical_count} Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-2)]">
                Prioritized weekly agenda dynamically computed from your active pursuits, closing windows, and verified Business DNA.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => router.push('/whitespace')}>
              <Layers className="h-3.5 w-3.5 mr-1 text-cyan-400" />
              Whitespace Engine
            </Button>
          </div>
        </div>

        {queueLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : (!workQueue || workQueue.items.length === 0) ? (
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-[var(--text-1)]">All weekly priority actions completed</p>
            <p className="text-[11px] text-[var(--text-3)] mt-0.5">Explore new opportunities in Radar or run the Opportunity Simulator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workQueue.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-3.5 rounded-xl border bg-[var(--bg)] flex flex-col justify-between gap-3 transition-colors",
                  item.priority === 'critical' ? 'border-red-500/30 hover:border-red-500/50' :
                  item.priority === 'high' ? 'border-amber-500/30 hover:border-amber-500/50' :
                  'border-[var(--border)] hover:border-blue-500/50'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                      item.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      item.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    )}>
                      {item.priority}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-3)] flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {item.due_date}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-1)] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-2)] mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                  <Button
                    size="sm"
                    variant={item.priority === 'critical' ? 'default' : 'outline'}
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    onClick={() => router.push(item.action_url)}
                  >
                    {item.action_label}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MANAGER & MEMBER PIPELINE TRACKER */}
      {(role === 'manager' || role === 'member' || role === 'owner') && applications && applications.length > 0 && (
        <section className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[var(--text-1)]">
                {role === 'manager' ? 'Team Pursuit Dispatch Pipeline' : 'Active Pursuit Pipeline'}
              </h2>
              <p className="text-xs text-[var(--text-2)]">Real-time status of applications across execution stages.</p>
            </div>
            <button onClick={() => router.push('/workspace')} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
              Open Studio <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {['draft', 'in_progress', 'review', 'submitted'].map((stage) => {
              const stageApps = applications.filter((a: any) => a.status === stage)
              return (
                <div key={stage} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                      {stage.replace('_', ' ')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-[var(--surface)] border border-[var(--border)]">
                      {stageApps.length}
                    </span>
                  </div>
                  {stageApps.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {stageApps.slice(0, 2).map((app: any) => (
                        <div 
                          key={app.id}
                          onClick={() => router.push(`/workspace/${app.id}`)}
                          className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs cursor-pointer hover:border-blue-500/50 transition-colors"
                        >
                          <p className="font-semibold text-[var(--text-1)] truncate">{app.title}</p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-[var(--text-3)]">
                            <span>Stage: {app.status}</span>
                            <span className="text-blue-500 font-medium">View →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--text-3)] italic mt-2">No active items</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ANALYST SPECIAL: AI ANALYST QUICK LAUNCH */}
      {role === 'analyst' && (
        <section className="p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-1)]">AI Opportunity Intelligence Analyst</h3>
              <p className="text-xs text-[var(--text-2)] mt-0.5">
                Run deep competitive match queries, evaluate RFP eligibility gaps, or query market trends against Business DNA.
              </p>
            </div>
          </div>
          <Button size="sm" variant="default" onClick={() => router.push('/ai-analyst')}>
            Launch Terminal →
          </Button>
        </section>
      )}

      {/* TOP OPPORTUNITIES FOR YOU */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>Top Opportunities For You</h2>
            <p className="text-xs text-[var(--text-3)]">Algorithmic recommendations matched to your Business DNA</p>
          </div>
          <button onClick={() => router.push('/radar')} className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            View Radar →
          </button>
        </div>
        {recsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : !recommendations?.length ? (
          <EmptyState preset="no-opportunities" action={{ label: 'Explore Opportunities', onClick: () => router.push('/radar') }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((opp: any) => (
              <OpportunityCard key={opp.id} opportunity={opp} score={opp.score} />
            ))}
          </div>
        )}
      </section>

      {/* RECENT ALERTS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>Recent Alerts</h2>
            <p className="text-xs text-[var(--text-3)]">Real-time signals and deadline updates</p>
          </div>
          <button onClick={() => router.push('/alerts')} className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            All Alerts →
          </button>
        </div>
        {alertsLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : !alerts?.data?.length ? (
          <EmptyState preset="no-alerts" />
        ) : (
          <div className="space-y-2">
            {alerts.data.slice(0, 4).map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/30 transition-colors">
                <Bell className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{alert.title}</p>
                  <p className="text-xs text-[var(--text-2)] truncate mt-0.5">{alert.body}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>{timeAgo(alert.created_at)}</p>
                </div>
                {!alert.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
