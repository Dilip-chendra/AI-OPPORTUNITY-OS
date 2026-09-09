import { cn } from '@/lib/utils'

export function Separator({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical'; className?: string }) {
  return <div className={cn('border-[var(--border)]', orientation === 'horizontal' ? 'border-t w-full my-4' : 'border-l h-full mx-4', className)} />
}
