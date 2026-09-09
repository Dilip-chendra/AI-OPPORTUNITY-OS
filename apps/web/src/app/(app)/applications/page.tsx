'use client'
import { useQuery } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api/applications'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Clock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Application } from '@/types'

export default function ApplicationsPage() {
  const router = useRouter()
  const { data: apps, isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: applicationsApi.list,
  })

  const list = apps || []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Application Tracker</h1>
            <p className="text-xs sm:text-sm text-[var(--text-2)]">Manage active pursuits, submissions, and win/loss records.</p>
          </div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push('/radar')}>
          New Pursuit
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : !list.length ? (
        <EmptyState
          preset="no-applications"
          action={{ label: 'Find Opportunities to Pursue', onClick: () => router.push('/radar') }}
        />
      ) : (
        <div className="space-y-3">
          {list.map((app: Application) => (
            <div key={app.id} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between hover:border-blue-500/30 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-[var(--text-1)]">{app.title}</h3>
                  <Badge variant={app.status === 'won' ? 'success' : app.status === 'in_progress' ? 'default' : 'outline'}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-3)] flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Updated recently
                </p>
              </div>
              <Link href={`/workspace/${app.id}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                  Open Studio
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
