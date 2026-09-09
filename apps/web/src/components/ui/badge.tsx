import { cn } from '@/lib/utils'

const VARIANTS = {
  default: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ai: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  outline: 'border border-[var(--border)] text-[var(--text-2)] bg-transparent',
  verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  demo: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  government: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  funding: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  corporate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  global: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  startup: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  innovation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  partnership: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export interface BadgeProps {
  variant?: keyof typeof VARIANTS
  size?: 'sm' | 'md'
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', size = 'sm', className, children }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      VARIANTS[variant],
      className
    )}>
      {children}
    </span>
  )
}
