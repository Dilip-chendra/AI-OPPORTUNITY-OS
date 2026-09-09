'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, Radar, Compass, Sparkles,
  Wallet, Building2, Briefcase, Globe, Handshake, Lightbulb, FlaskConical,
  Bookmark, FileText, FolderOpen, Bot,
  Fingerprint, Bell, BarChart3, Settings,
  ChevronLeft, ChevronRight, Zap, X
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Discovery',
    items: [
      { href: '/overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: '/radar', label: 'Opportunity Radar', icon: <Radar className="h-4 w-4" /> },
      { href: '/explore', label: 'Explore', icon: <Compass className="h-4 w-4" /> },
      { href: '/for-you', label: 'For You', icon: <Sparkles className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Categories',
    items: [
      { href: '/funding', label: 'Funding', icon: <Wallet className="h-4 w-4" /> },
      { href: '/government', label: 'Government', icon: <Building2 className="h-4 w-4" /> },
      { href: '/corporate', label: 'Corporate', icon: <Briefcase className="h-4 w-4" /> },
      { href: '/global', label: 'Global', icon: <Globe className="h-4 w-4" /> },
      { href: '/partnerships', label: 'Partnerships', icon: <Handshake className="h-4 w-4" /> },
      { href: '/innovation', label: 'Innovation', icon: <Lightbulb className="h-4 w-4" /> },
      { href: '/research', label: 'Research', icon: <FlaskConical className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { href: '/saved', label: 'Saved', icon: <Bookmark className="h-4 w-4" /> },
      { href: '/applications', label: 'Applications', icon: <FileText className="h-4 w-4" /> },
      { href: '/workspace', label: 'Workspace', icon: <FolderOpen className="h-4 w-4" /> },
      { href: '/ai-analyst', label: 'AI Analyst', icon: <Bot className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Manage',
    items: [
      { href: '/business-dna', label: 'Business DNA', icon: <Fingerprint className="h-4 w-4" /> },
      { href: '/alerts', label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
      { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
      { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  alertCount?: number
}

export function Sidebar({ collapsed, onToggleCollapse, alertCount = 0 }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r transition-all duration-200 shrink-0',
        'border-[var(--border)]',
        'bg-[var(--surface)]',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 border-b border-[var(--border)] px-3',
        collapsed ? 'justify-center' : 'gap-2.5'
      )}>
        <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-1)' }}>OpportunityOS</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>Discover. Decide. Capture.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const hasAlert = item.href === '/alerts' && alertCount > 0

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'nav-link',
                      isActive && 'active',
                      collapsed && 'justify-center px-0'
                    )}
                  >
                    <span className="shrink-0 relative">
                      {item.icon}
                      {hasAlert && (
                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                          {alertCount > 9 ? '9+' : alertCount}
                        </span>
                      )}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && hasAlert && (
                      <span className="ml-auto text-xs font-medium text-red-500">{alertCount}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[var(--border)]">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all',
            'hover:bg-[var(--border)]'
          )}
          style={{ color: 'var(--text-3)' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4 mx-auto" />
            : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  )
}
