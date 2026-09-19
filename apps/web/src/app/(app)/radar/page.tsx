'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { OpportunityCard, CardSkeleton } from '@/components/opportunity/opportunity-card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, Target, Zap, Star, Clock } from 'lucide-react'
import type { OpportunityFilters } from '@/types'

export default function RadarPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<OpportunityFilters>({ page: 1, page_size: 12 })
  const [showFilters, setShowFilters] = useState(false)

  const query = useQuery({
    queryKey: ['opportunities', filters, search],
    queryFn: () => opportunitiesApi.list({ ...filters, search: search || undefined }),
  })

  const { data: stats } = useQuery({
    queryKey: ['opportunity-stats'],
    queryFn: opportunitiesApi.stats,
    staleTime: 2 * 60 * 1000,
  })

  const totalPages = query.data?.total_pages ?? 1

  const statItems = [
    { label: 'Discovered', val: stats?.total ?? '...', icon: <Target className="h-3.5 w-3.5" />, color: 'text-blue-400' },
    { label: 'Matched', val: stats?.matched ?? '...', icon: <Zap className="h-3.5 w-3.5" />, color: 'text-violet-400' },
    { label: 'High Relevance', val: stats?.high_relevance ?? '...', icon: <Star className="h-3.5 w-3.5" />, color: 'text-amber-400' },
    { label: 'Urgent (14d)', val: stats?.urgent ?? '...', icon: <Clock className="h-3.5 w-3.5" />, color: 'text-rose-400' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Opportunity Radar</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-2)' }}>The opportunities that matter to your business, ranked by AI.</p>

        {/* Real stats — from live DB */}
        <div className="flex flex-wrap gap-6 mb-4">
          {statItems.map(({ label, val, icon, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={color}>{icon}</span>
              <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-1)' }}>{val}</span>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search opportunities by title, organization, keyword..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              leftElement={<Search className="h-4 w-4" />}
            />
          </div>
          <Button variant="outline" leftIcon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] grid grid-cols-2 md:grid-cols-4 gap-3">
            {['government', 'funding', 'corporate', 'global', 'partnerships', 'innovation', 'research'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? undefined : cat, page: 1 }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filters.category === cat
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-[var(--border)] text-[var(--text-2)] hover:border-blue-500'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
            {filters.category && (
              <button onClick={() => setFilters(f => ({ ...f, category: undefined, page: 1 }))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-500 text-rose-400 hover:bg-rose-500/10">
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {query.isError && <ErrorState onRetry={() => query.refetch()} />}

      {query.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : query.data?.data.length === 0 ? (
        <EmptyState title="No opportunities found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {query.data?.data.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" disabled={filters.page === 1}
            onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}>
            Previous
          </Button>
          <span className="text-sm" style={{ color: 'var(--text-2)' }}>Page {filters.page} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={filters.page === totalPages}
            onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
