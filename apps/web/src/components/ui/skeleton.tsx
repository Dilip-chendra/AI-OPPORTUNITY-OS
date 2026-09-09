import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton rounded-lg', className)} {...props} />
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-1.5" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <Skeleton className="h-3 w-1/2 mb-4" />
      <div className="flex justify-between mb-4">
        <div><Skeleton className="h-6 w-20 mb-1" /><Skeleton className="h-3 w-16" /></div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  )
}
