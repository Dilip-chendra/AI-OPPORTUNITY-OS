import { cn } from '@/lib/utils'
import { Button } from './button'
import { Bookmark, FileText, Bell, BarChart3, Search, Zap } from 'lucide-react'

const PRESETS = {
  'no-opportunities': { icon: <Zap className="h-8 w-8" />, title: 'No opportunities match your filters', description: 'Try adjusting your search terms or clearing active filters.' },
  'no-saved': { icon: <Bookmark className="h-8 w-8" />, title: 'No saved opportunities yet', description: 'Save opportunities you want to revisit or evaluate with your team.' },
  'no-applications': { icon: <FileText className="h-8 w-8" />, title: 'No active pursuits yet', description: 'Click Pursue on an opportunity to launch an execution workspace.' },
  'no-alerts': { icon: <Bell className="h-8 w-8" />, title: 'No alerts', description: 'You are all caught up! Deadline and corrigendum alerts will appear here.' },
  'no-analytics': { icon: <BarChart3 className="h-8 w-8" />, title: 'No pipeline data yet', description: 'Pipeline analytics will populate as you save and pursue opportunities.' },
  'no-results': { icon: <Search className="h-8 w-8" />, title: 'No matching records found', description: 'Try a different search query or broaden filter parameters.' },
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
