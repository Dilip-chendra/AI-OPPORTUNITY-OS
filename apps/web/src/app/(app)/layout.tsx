'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/app/sidebar'
import { TopNav } from '@/components/app/top-nav'
import { CommandPalette } from '@/components/app/command-palette'
import { useAuth } from '@/lib/hooks/use-auth'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax'
      }
      router.replace('/login')
      return
    }
    const col = localStorage.getItem('sidebar_collapsed')
    if (col === 'true') setCollapsed(true)

    // Global keyboard shortcut for Command Palette: Ctrl+K or Cmd+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // run once on mount — router is stable

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar_collapsed', String(next))
  }

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav sidebarCollapsed={collapsed} onOpenSearch={() => setPaletteOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
