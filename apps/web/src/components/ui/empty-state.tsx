import { cn } from '@/lib/utils'
import { Button } from './button'
import { Bookmark, FileText, Bell, BarChart3, Search, Zap } from 'lucide-react'

const PRESETS = {
  'no-opportunities': { icon: <Zap className="h-8 w-8" />, title: 'No opportunities found', description: 'Try adjusting your filters or search terms.' },
  'no-saved': { icon: <Bookmark className="h-8 w-8" />, title: 'No saved opportunities', description: 'Save opportunities you want to revisit or pursue later.' },
  'no-applications': { icon: <FileText className="h-8 w-8" />, title: 'No applications yet', description: 'Pursue an opportunity to create your first application.' },
  'no-alerts': { icon: <Bell className="h-8 w-8" />, title: 'No alerts', description: 'You are all caught up! New alerts will appear here.' },
  'no-analytics': { icon: <BarChart3 className="h-8 w-8" />, title: 'No data yet', description: 'Analytics will populate as you explore and pursue opportunities.' },
  'no-results': { icon: <Search className="h-8 w-8" />, title: 'No results found', description: 'Try a different search query or clear your filters.' },
}

interface EmptyStateProps {
  preset?: keyof typeof PRESETS
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ preset, icon, title, description, action, className }: EmptyStateProps) {
  const p = preset ? PRESETS[preset] : null
  const _icon = icon || p?.icon
  const _title = title || p?.title || 'Nothing here yet'
  const _description = description || p?.description

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {_icon && (
        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--border)', color: 'var(--text-3)' }}>
          {_icon}
        </div>
      )}
      <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-1)' }}>{_title}</h3>
      {_description && <p className="text-sm max-w-sm" style={{ color: 'var(--text-2)' }}>{_description}</p>}
      {action && (
        <Button className="mt-5" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
