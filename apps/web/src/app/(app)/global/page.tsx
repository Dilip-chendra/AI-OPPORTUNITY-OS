'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { OpportunityCard, CardSkeleton } from '@/components/opportunity/opportunity-card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function CategoryPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['opportunities', 'global', page, search],
    queryFn: () => opportunitiesApi.list({ category: 'global', page, page_size: 12, search: search || undefined }),
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] mb-1">Global & Export Opportunities</h1>
        <p className="text-sm text-[var(--text-2)]">World Bank, UN procurement, cross-border infrastructure, and international grants.</p>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search global & export opportunities..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftElement={<Search className="h-4 w-4" />}
        />
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !data?.data?.length ? (
        <EmptyState preset="no-opportunities" description="No global & export opportunities match your current search." action={{ label: 'Clear Search', onClick: () => setSearch('') }} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} score={opp.score} />
            ))}
          </div>

          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button variant="outline" size="sm" disabled={!data.has_prev} onClick={() => setPage((p) => p - 1)}>
                ← Previous
              </Button>
              <span className="text-xs text-[var(--text-2)] font-mono">
                Page {data.page} of {data.total_pages}
              </span>
              <Button variant="outline" size="sm" disabled={!data.has_next} onClick={() => setPage((p) => p + 1)}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
