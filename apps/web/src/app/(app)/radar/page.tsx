'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { OpportunityCard, CardSkeleton } from '@/components/opportunity/opportunity-card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import type { OpportunityFilters } from '@/types'

export default function RadarPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<OpportunityFilters>({ page: 1, page_size: 12 })
  const [showFilters, setShowFilters] = useState(false)

  const query = useQuery({
    queryKey: ['opportunities', filters, search],
    queryFn: () => opportunitiesApi.list({ ...filters, search: search || undefined }),
  })

  const totalPages = query.data?.total_pages ?? 1

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Opportunity Radar</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-2)' }}>The opportunities that matter to your business, ranked by AI.</p>

        <div className="flex flex-wrap gap-4 mb-4">
          {[['Discovered', query.data?.total ?? '...'], ['Matched', query.data ? Math.floor((query.data.total || 0) * 0.3) : '...'], ['High Relevance', '12'], ['Urgent', '5']].map(([label, val]) => (
            <div key={label as string} className="flex items-center gap-2">
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
            {['government', 'funding', 'corporate', 'global', 'startup', 'innovation', 'partnership'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilters(f => ({ ...f, category: (f as any).category === cat ? undefined : cat as any, page: 1 }))}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize"
                style={{
                  borderColor: 'var(--border)',
                  background: (filters as any).category === cat ? '#2563EB' : 'var(--bg)',
                  color: (filters as any).category === cat ? 'white' : 'var(--text-2)'
                }}
              >{cat}</button>
            ))}
            <button onClick={() => setFilters({ page: 1, page_size: 12 })} className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg border border-[var(--border)]">
              Clear All
            </button>
          </div>
        )}
      </div>

      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !query.data?.data?.length ? (
        <EmptyState preset="no-results" action={{ label: 'Clear Filters', onClick: () => { setSearch(''); setFilters({ page: 1, page_size: 12 }) } }} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {query.data.data.map((opp: any) => (
              <OpportunityCard key={opp.id} opportunity={opp} score={opp.score} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={!query.data.has_prev}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}>← Previous</Button>
              <span className="text-sm" style={{ color: 'var(--text-2)' }}>Page {filters.page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={!query.data.has_next}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}>Next →</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
