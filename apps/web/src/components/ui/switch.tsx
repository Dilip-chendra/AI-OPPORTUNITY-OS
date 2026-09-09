'use client'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors duration-200',
          checked ? 'bg-blue-600' : 'bg-[var(--border)]'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
          checked && 'translate-x-4'
        )} />
      </button>
      {label && <span className="text-sm" style={{ color: 'var(--text-1)' }}>{label}</span>}
    </label>
  )
}
