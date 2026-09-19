'use client'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/analytics'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { MetricCard } from '@/components/ui/metric-card'
import { BarChart3, TrendingUp, Target, Trophy, FileText, Percent } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-full'],
    queryFn: analyticsApi.overview,
  })
  const { data: stats } = useQuery({
    queryKey: ['opportunity-stats'],
    queryFn: opportunitiesApi.stats,
  })

  const total = stats?.total || 0
  const byCategory = stats?.by_category || {}
  const catEntries = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Opportunity Analytics & Win Rate</h1>
          <p className="text-xs sm:text-sm text-[var(--text-2)]">Track discovery velocity, qualification accuracy, and won contract value.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Discovered Opportunities" value={data?.opportunities_discovered ?? '—'} icon={<Target className="h-4 w-4" />} loading={isLoading} />
        <MetricCard label="Qualified Matches" value={data?.opportunities_matched ?? '—'} icon={<TrendingUp className="h-4 w-4" />} loading={isLoading} />
        <MetricCard label="Pursuits Initiated" value={data?.opportunities_pursued ?? '—'} icon={<FileText className="h-4 w-4" />} loading={isLoading} />
        <MetricCard label="Proposals Submitted" value={data?.opportunities_submitted ?? '—'} loading={isLoading} />
        <MetricCard label="Contracts Won" value={data?.opportunities_won ?? '—'} icon={<Trophy className="h-4 w-4" />} loading={isLoading} />
        <MetricCard label="Win Rate" value={data ? `${data.win_rate}%` : '—'} icon={<Percent className="h-4 w-4" />} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real pipeline distribution from live DB */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <h3 className="text-base font-bold mb-4 text-[var(--text-1)]">Pipeline Distribution by Channel</h3>
          <div className="space-y-2 text-xs">
            {catEntries.length === 0 && (
              <p className="text-[var(--text-3)] italic">No data yet — opportunities loading...</p>
            )}
            {catEntries.map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[var(--text-1)] font-medium capitalize">{cat.replace('_', ' ')}</span>
                    <span className="font-mono font-bold text-blue-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pipeline value summary */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <h3 className="text-base font-bold mb-4 text-[var(--text-1)]">Value Summary</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <span className="text-[var(--text-1)] font-medium">Estimated Pipeline Value</span>
              <span className="font-mono font-bold text-emerald-400">
                {data?.estimated_pipeline_value ? formatCurrency(data.estimated_pipeline_value) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <span className="text-[var(--text-1)] font-medium">Realized Contract Value</span>
              <span className="font-mono font-bold text-blue-400">
                {data?.realized_value ? formatCurrency(data.realized_value) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <span className="text-[var(--text-1)] font-medium">High Priority Matches</span>
              <span className="font-mono font-bold text-amber-400">{data?.high_priority_count ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <span className="text-[var(--text-1)] font-medium">Avg Match Score</span>
              <span className="font-mono font-bold text-violet-400">{data?.average_match_score ? `${data.average_match_score}/100` : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
