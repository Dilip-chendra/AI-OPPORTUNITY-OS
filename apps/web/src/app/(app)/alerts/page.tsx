'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsApi } from '@/lib/api/alerts'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Bell, CheckCheck } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

export default function AlertsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['alerts-feed'],
    queryFn: () => alertsApi.list({ page_size: 20 }),
  })

  const markAllMutation = useMutation({
    mutationFn: alertsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts-feed'] }),
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Notifications & Radar Alerts</h1>
            <p className="text-xs sm:text-sm text-[var(--text-2)]">Real-time alerts on new high-score matches, deadline reminders, and status changes.</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<CheckCheck className="h-4 w-4" />}
          onClick={() => markAllMutation.mutate()}
          disabled={!data?.data?.length}
        >
          Mark All Read
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : !data?.data?.length ? (
        <EmptyState preset="no-alerts" />
      ) : (
        <div className="space-y-2.5">
          {data.data.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                alert.is_read
                  ? 'border-[var(--border)] bg-[var(--surface)] opacity-70'
                  : 'border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0 text-blue-500 mt-0.5">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-1)]">{alert.title}</h4>
                  <p className="text-xs text-[var(--text-2)] mt-0.5">{alert.body}</p>
                  <span className="text-[10px] font-mono text-[var(--text-3)] mt-2 block">{timeAgo(alert.created_at)}</span>
                </div>
              </div>
              {!alert.is_read && (
                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
