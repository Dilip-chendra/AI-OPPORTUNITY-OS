'use client'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/analytics'
import { MetricCard } from '@/components/ui/metric-card'
import { BarChart3, TrendingUp, Target, Trophy, FileText, Percent, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-full'],
    queryFn: analyticsApi.overview,
  })

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
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <h3 className="text-base font-bold mb-4 text-[var(--text-1)]">Pipeline Distribution by Channel</h3>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Government & Public Tenders', pct: '48%' },
              { label: 'Corporate RFPs', pct: '26%' },
              { label: 'Innovation Grants & Schemes', pct: '16%' },
              { label: 'Global & Multilateral', pct: '10%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                <span className="text-[var(--text-1)] font-medium">{item.label}</span>
                <span className="font-mono font-bold text-blue-500">{item.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <h3 className="text-base font-bold mb-4 text-[var(--text-1)]">Decision Precision Accuracy</h3>
          <div className="space-y-3 text-xs">
            {[
              { label: 'AI Match Accuracy vs Actual Shortlisting', score: '94.2%' },
              { label: 'Average Time Saved per RFP Qualification', score: '18.5 hrs' },
              { label: 'Disqualification Risk Avoidance Index', score: '99.1%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                <span className="text-[var(--text-1)] font-medium">{item.label}</span>
                <span className="font-mono font-bold text-emerald-500">{item.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
