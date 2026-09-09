import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface MetricCardProps {
  label: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  description?: string
  className?: string
  loading?: boolean
}

export function MetricCard({ label, value, change, icon, description, className, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn('rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5', className)}>
        <div className="flex justify-between mb-3"><Skeleton className="h-4 w-24" />{icon && <Skeleton className="h-5 w-5 rounded" />}</div>
        <Skeleton className="h-7 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    )
  }
  return (
    <div className={cn('rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{label}</p>
        {icon && <span className="text-blue-500 opacity-70">{icon}</span>}
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>{value}</p>
      <div className="flex items-center gap-2">
        {change !== undefined && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', change >= 0 ? 'text-emerald-500' : 'text-red-500')}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
        )}
        {description && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{description}</span>}
      </div>
    </div>
  )
}
