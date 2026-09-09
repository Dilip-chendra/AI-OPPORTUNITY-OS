import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'signal' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const VARIANT_CLASSES: Record<string, string> = {
  default: 'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:active:bg-zinc-200 shadow-sm border border-zinc-700/20 dark:border-white/20',
  primary: 'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 dark:active:bg-zinc-200 shadow-sm border border-zinc-700/20 dark:border-white/20',
  signal: 'bg-cyan-500 text-zinc-950 font-semibold hover:bg-cyan-400 active:bg-cyan-600 shadow-sm shadow-cyan-500/20 border border-cyan-400/40',
  secondary: 'bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-1)] hover:bg-[var(--border)] hover:border-[var(--text-3)]/40 active:bg-[var(--border)]',
  outline: 'border border-[var(--border)] bg-transparent text-[var(--text-1)] hover:bg-[var(--surface-elevated)] hover:border-[var(--text-2)] active:bg-[var(--border)]',
  ghost: 'bg-transparent text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--border-subtle)] active:bg-[var(--border)]',
  danger: 'bg-red-600/90 text-white hover:bg-red-600 active:bg-red-700 shadow-sm border border-red-500/30',
  ai: 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-sm border border-indigo-400/30',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm border border-emerald-400/30',
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'h-8 px-3 text-xs tracking-tight',
  md: 'h-10 px-4 text-sm font-medium',
  lg: 'h-12 px-6 text-sm tracking-wide font-medium',
  xl: 'h-14 px-8 text-base tracking-wide font-semibold',
  icon: 'h-10 w-10 p-0',
  'icon-sm': 'h-8 w-8 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'group inline-flex items-center justify-center gap-2.5 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.99]',
          VARIANT_CLASSES[variant] || VARIANT_CLASSES.default,
          SIZE_CLASSES[size] || SIZE_CLASSES.md,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : leftIcon}
        <span>{children}</span>
        {!loading && rightIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'

