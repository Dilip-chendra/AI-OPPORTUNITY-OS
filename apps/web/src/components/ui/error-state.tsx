import { AlertTriangle } from 'lucide-react'
import { Button } from './button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this data. Please try again.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-1)' }}>{title}</h3>
      <p className="text-sm max-w-sm mb-5" style={{ color: 'var(--text-2)' }}>{description}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try Again</Button>}
    </div>
  )
}
