'use client'
import { useQuery } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { OpportunityCard, CardSkeleton } from '@/components/opportunity/opportunity-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { Radar, Zap } from 'lucide-react'

export default function EarlySignalsPage() {
  // Fetch opportunities with early signal types
  const { data, isLoading } = useQuery({
    queryKey: ['signals'],
    queryFn: () => opportunitiesApi.list({ opportunity_type: 'eoi', page_size: 20 }),
  })
  const { data: rfi } = useQuery({
    queryKey: ['signals-rfi'],
    queryFn: () => opportunitiesApi.list({ opportunity_type: 'rfi', page_size: 20 }),
  })

  const combined = [
    ...(data?.data || []),
    ...(rfi?.data || []),
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
          <Radar className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Early Signals Radar</h1>
          <p className="text-sm text-[var(--text-2)]">Pre-RFP signals, EOIs, and RFIs — get ahead before competitors know.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline"><Zap className="h-3 w-3 mr-1" />Pre-Opportunity Intelligence</Badge>
        <span className="text-xs text-[var(--text-3)]">{combined.length} early signals detected</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : combined.length === 0 ? (
        <EmptyState title="No early signals yet" description="EOIs and RFIs will appear here as they are detected from live sources." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {combined.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />)}
        </div>
      )}
    </div>
  )
}
