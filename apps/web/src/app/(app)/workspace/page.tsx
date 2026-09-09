'use client'
import { useQuery } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api/applications'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/ui/metric-card'
import { FolderOpen, Plus, Clock, ArrowRight, ShieldCheck, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Application } from '@/types'

export default function WorkspacePage() {
  const router = useRouter()
  const { data: apps, isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: applicationsApi.list,
  })

  const stageColumns = [
    { key: 'draft', label: '1. Drafting & Inception', color: 'border-blue-500/40 bg-blue-50/10' },
    { key: 'in_progress', label: '2. Compliance & Technical', color: 'border-violet-500/40 bg-violet-50/10' },
    { key: 'review', label: '3. Internal Review', color: 'border-amber-500/40 bg-amber-50/10' },
    { key: 'submitted', label: '4. Submitted', color: 'border-cyan-500/40 bg-cyan-50/10' },
    { key: 'won', label: '5. Awarded / Won', color: 'border-emerald-500/40 bg-emerald-50/10' },
  ]

  const items: Application[] = apps || []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Pursuit Workspaces & Kanban</h1>
            <p className="text-xs sm:text-sm text-[var(--text-2)]">Active proposal drafting, compliance matrices, and bid progression pipelines.</p>
          </div>
        </div>

        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push('/radar')}>
          Pursue New Opportunity
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Active Pursuit Workspaces" value={items.length} icon={<FolderOpen className="h-4 w-4" />} loading={isLoading} />
        <MetricCard label="Weighted Pipeline Value" value="₹8.4 Cr" icon={<ShieldCheck className="h-4 w-4" />} loading={isLoading} />
        <MetricCard label="Historical Win Rate" value="68%" icon={<Trophy className="h-4 w-4" />} loading={isLoading} />
      </div>

      {/* Kanban Board View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-80 rounded-2xl" />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState
          preset="no-applications"
          title="No active pursuit workspaces"
          description="Click 'Pursue' on any opportunity in your Opportunity Radar to launch an execution workspace with compliance matrices and AI proposal drafting."
          action={{ label: 'Explore Opportunity Radar', onClick: () => router.push('/radar') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {stageColumns.map((col) => {
            const colItems = items.filter(
              (a: Application) =>
                a.status === col.key ||
                (col.key === 'in_progress' && !['draft', 'review', 'submitted', 'won', 'lost'].includes(a.status))
            )
            return (
              <div key={col.key} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-bold text-[var(--text-1)]">{col.label}</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--text-3)]">
                    {colItems.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colItems.map((app: Application) => (
                    <Link
                      key={app.id}
                      href={`/workspace/${app.id}`}
                      className="block p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-blue-500/40 hover:shadow-md transition-all group"
                    >
                      <h4 className="font-bold text-xs line-clamp-2 text-[var(--text-1)] group-hover:text-blue-500 transition-colors mb-2">
                        {app.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-3)] pt-2 border-t border-[var(--border)]">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Open Studio</span>
                        <ArrowRight className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                  {colItems.length === 0 && (
                    <div className="h-32 border border-dashed border-[var(--border)] rounded-xl flex items-center justify-center text-[11px] text-[var(--text-3)]">
                      No bids in this stage
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
