'use client'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Search, Sun, Moon, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { cn } from '@/lib/utils'
import Link from 'next/link'

import { getRoleBadgeConfig } from '@/lib/permissions'

interface TopNavProps {
  sidebarCollapsed?: boolean
  alertCount?: number
}

export function TopNav({ sidebarCollapsed, alertCount = 0 }: TopNavProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const roleConfig = getRoleBadgeConfig(user?.role)

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <header
      className={cn(
        'h-14 flex items-center gap-3 px-4 border-b shrink-0',
        'border-[var(--border)] bg-[var(--surface)]'
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div
          className={cn(
            'flex items-center gap-2 px-3 h-8 rounded-lg border text-sm cursor-pointer transition-colors',
            'border-[var(--border)] hover:border-blue-500/50',
          )}
          style={{ color: 'var(--text-3)', background: 'var(--bg)' }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">Search opportunities...</span>
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)]">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Organization Name & Role Badge (Desktop) */}
        {user?.organization_name && (
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs">
            <span className="font-medium truncate max-w-[200px]" style={{ color: 'var(--text-2)' }} title={user.organization_name}>
              {user.organization_name}
            </span>
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider', roleConfig.color)}>
              {roleConfig.label}
            </span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--border)]"
          style={{ color: 'var(--text-2)' }}
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />
          }
        </button>

        {/* Alerts */}
        <Link
          href="/alerts"
          className="relative h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--border)]"
          style={{ color: 'var(--text-2)' }}
          title="Alerts"
        >
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[var(--surface)]" />
          )}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 h-8 px-2 rounded-lg transition-colors hover:bg-[var(--border)]"
            style={{ color: 'var(--text-1)' }}
          >
            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium max-w-[180px] truncate" title={user?.full_name || 'Account'}>
              {user?.full_name || 'Account'}
            </span>
            <ChevronDown className="h-3 w-3 hidden sm:block" style={{ color: 'var(--text-3)' }} />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div
                className="absolute right-0 top-10 z-50 w-56 rounded-xl border shadow-lg py-1"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="px-3 py-2 border-b space-y-1" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                      {user?.full_name}
                    </p>
                    <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase', roleConfig.color)}>
                      {roleConfig.label}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
                    {user?.email}
                  </p>
                  {user?.organization_name && (
                    <p className="text-[11px] font-medium text-blue-500 truncate">
                      Org: {user.organization_name}
                    </p>
                  )}
                </div>

                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--border)] transition-colors"
                  style={{ color: 'var(--text-2)' }}
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--border)] transition-colors"
                  style={{ color: 'var(--text-2)' }}
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => { setUserMenuOpen(false); logout() }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
