'use client'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/analytics'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { alertsApi } from '@/lib/api/alerts'
import { useAuth } from '@/lib/hooks/use-auth'
import { MetricCard } from '@/components/ui/metric-card'
import { OpportunityCard, CardSkeleton } from '@/components/opportunity/opportunity-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useRouter } from 'next/navigation'
import { getGreeting, timeAgo, formatCurrency } from '@/lib/utils'
import { Bell, Clock, Target, TrendingUp } from 'lucide-react'

export default function OverviewPage() {
  const { user } = useAuth()
  const router = useRouter()

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: analyticsApi.overview,
  })

  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => opportunitiesApi.recommendations(6),
  })

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.list({ page_size: 5 }),
  })

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
          {getGreeting()}, {firstName}.
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
          Here is your opportunity intelligence summary.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Pipeline Value" loading={analyticsLoading}
          value={analytics ? formatCurrency(analytics.estimated_pipeline_value) : '—'}
          icon={<TrendingUp className="h-4 w-4" />}
          description="estimated"
        />
        <MetricCard
          label="New Matches" loading={analyticsLoading}
          value={analytics?.new_matches_this_week ?? '—'}
          icon={<Target className="h-4 w-4" />}
          description="this week"
        />
        <MetricCard
          label="High Priority" loading={analyticsLoading}
          value={analytics?.high_priority_count ?? '—'}
          description="requiring attention"
        />
        <MetricCard
          label="Deadlines" loading={analyticsLoading}
          value={analytics?.deadlines_this_week ?? '—'}
          icon={<Clock className="h-4 w-4" />}
          description="in 7 days"
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>Top Opportunities For You</h2>
          <button onClick={() => router.push('/radar')} className="text-sm text-blue-500 hover:text-blue-600">View all →</button>
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

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>Recent Alerts</h2>
          <button onClick={() => router.push('/alerts')} className="text-sm text-blue-500 hover:text-blue-600">View all →</button>
        </div>
        {alertsLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : !alerts?.data?.length ? (
          <EmptyState preset="no-alerts" />
        ) : (
          <div className="space-y-2">
            {alerts.data.slice(0, 5).map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <Bell className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{alert.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgo(alert.created_at)}</p>
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
