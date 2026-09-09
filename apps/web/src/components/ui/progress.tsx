import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  size?: 'sm' | 'md'
  showLabel?: boolean
}

const COLORS = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  purple: 'bg-violet-500',
}

export function Progress({ value, max = 100, className, color = 'blue', size = 'sm', showLabel }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 rounded-full bg-[var(--border)] overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', COLORS[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-mono w-8 text-right" style={{ color: 'var(--text-3)' }}>{Math.round(pct)}</span>}
    </div>
  )
}
