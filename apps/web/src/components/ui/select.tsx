import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1">
      {label && <label htmlFor={selectId} className="block text-sm font-medium" style={{ color: 'var(--text-1)' }}>{label}</label>}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full h-9 pl-3 pr-8 rounded-lg border text-sm appearance-none transition-colors',
            'bg-[var(--bg)] border-[var(--border)] text-[var(--text-1)]',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
            error && 'border-red-500',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-3)' }} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
