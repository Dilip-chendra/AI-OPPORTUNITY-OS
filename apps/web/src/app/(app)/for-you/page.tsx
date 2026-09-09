'use client'
import { useQuery } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { OpportunityCard, CardSkeleton } from '@/components/opportunity/opportunity-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ForYouPage() {
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => opportunitiesApi.recommendations(12),
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Personalized For You</h1>
          <p className="text-xs sm:text-sm text-[var(--text-2)]">High-probability matches computed specifically for your verified Business DNA.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !data?.length ? (
        <EmptyState
          preset="no-opportunities"
          title="No recommendations yet"
          description="Complete your Business DNA profile so our AI can calculate your personalized match scores."
          action={{ label: 'Complete Business DNA', onClick: () => router.push('/business-dna') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} score={opp.score} />
          ))}
        </div>
      )}
    </div>
  )
}
