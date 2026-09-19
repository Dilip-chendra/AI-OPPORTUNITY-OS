'use client'
import { useQuery } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api/applications'
import { analyticsApi } from '@/lib/api/analytics'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/ui/metric-card'
import { FolderOpen, Plus, Clock, ArrowRight, ShieldCheck, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Application } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function WorkspacePage() {
  const router = useRouter()
  const { data: apps, isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: applicationsApi.list,
  })
  const { data: analytics } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: analyticsApi.overview,
  })

  const stageColumns = [
    { key: 'draft', label: '1. Drafting & Inception', color: 'border-blue-500/40 bg-blue-50/10' },
    { key: 'in_progress', label: '2. Compliance & Technical', color: 'border-violet-500/40 bg-violet-50/10' },
    { key: 'review', label: '3. Internal Review', color: 'border-amber-500/40 bg-amber-50/10' },
    { key: 'submitted', label: '4. Submitted', color: 'border-cyan-500/40 bg-cyan-50/10' },
    { key: 'won', label: '5. Awarded / Won', color: 'border-emerald-500/40 bg-emerald-50/10' },
  ]

  const items: Application[] = apps || []

  const pipelineValue = analytics?.estimated_pipeline_value
    ? formatCurrency(analytics.estimated_pipeline_value)
    : items.length > 0 ? '—' : '₹0'
  const winRate = analytics?.win_rate !== undefined ? `${analytics.win_rate}%` : '—'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Pursuit Workspace</h1>
            <p className="text-xs sm:text-sm text-[var(--text-2)]">Active proposal drafting, compliance matrices, and bid progression pipelines.</p>
          </div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push('/radar')}>
          Pursue New Opportunity
        </Button>
      </div>

      {/* Metrics Row — real data from analytics API */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Active Pursuit Workspaces" value={items.length} icon={<FolderOpen className="h-4 w-4" />} loading={isLoading} />
        <MetricCard label="Weighted Pipeline Value" value={pipelineValue} icon={<ShieldCheck className="h-4 w-4" />} loading={isLoading} />
        <MetricCard label="Historical Win Rate" value={winRate} icon={<Trophy className="h-4 w-4" />} loading={isLoading} />
      </div>

      {/* Kanban Board View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-80 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No active pursuits"
          description="Browse the Opportunity Radar to find and start pursuing opportunities."
          action={{ label: 'Explore Opportunities', onClick: () => router.push('/radar') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stageColumns.map(col => (
            <div key={col.key} className={`rounded-2xl border-2 p-4 min-h-[200px] ${col.color}`}>
              <h3 className="text-xs font-bold mb-3 uppercase tracking-wider text-[var(--text-2)]">{col.label}</h3>
              <div className="space-y-2">
                {items.filter(a => a.status === col.key).map(app => (
                  <Link
                    href={`/workspace/${app.id}`}
                    key={app.id}
                    className="block p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-blue-500/60 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-[var(--text-1)] line-clamp-2">{app.title}</p>
                    {app.deadline && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[var(--text-3)]">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(app.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </Link>
                ))}
                {items.filter(a => a.status === col.key).length === 0 && (
                  <p className="text-[11px] text-[var(--text-3)] italic">No pursuits here</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
