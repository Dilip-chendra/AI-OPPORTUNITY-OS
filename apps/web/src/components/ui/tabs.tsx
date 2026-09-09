'use client'
import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface TabsCtx { active: string; setActive: (v: string) => void }
const Ctx = createContext<TabsCtx>({ active: '', setActive: () => {} })

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [active, setActive] = useState(defaultValue)
  return <Ctx.Provider value={{ active, setActive }}><div className={className}>{children}</div></Ctx.Provider>
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-lg', className)} style={{ background: 'var(--border)' }}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active, setActive } = useContext(Ctx)
  return (
    <button
      onClick={() => setActive(value)}
      className={cn(
        'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
        active === value
          ? 'bg-[var(--surface)] shadow-sm text-[var(--text-1)]'
          : 'text-[var(--text-2)] hover:text-[var(--text-1)]',
        className
      )}
    >{children}</button>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = useContext(Ctx)
  if (active !== value) return null
  return <div className={cn('animate-fade-in', className)}>{children}</div>
}
