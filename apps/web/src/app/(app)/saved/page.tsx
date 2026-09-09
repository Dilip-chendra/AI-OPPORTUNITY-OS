'use client'
import { useQuery } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { OpportunityCard, CardSkeleton } from '@/components/opportunity/opportunity-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SavedPage() {
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: ['saved-opportunities'],
    queryFn: () => opportunitiesApi.saved(),
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
          <Bookmark className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Saved Pipeline</h1>
          <p className="text-xs sm:text-sm text-[var(--text-2)]">Opportunities bookmarked for in-depth team review and bidding.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !data?.data?.length ? (
        <EmptyState
          preset="no-saved"
          action={{ label: 'Explore Opportunity Radar', onClick: () => router.push('/radar') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} score={opp.score} isSaved />
          ))}
        </div>
      )}
    </div>
  )
}
