'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import {
  Search, X, Compass, Radar, Fingerprint, FolderOpen,
  Bot, Settings, Shield, Sparkles, Building2, Wallet,
  ArrowRight, CheckCircle2, Zap, Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  // Fast opportunity search when query length >= 2
  const { data: searchResults } = useQuery({
    queryKey: ['palette-search', query],
    queryFn: () => opportunitiesApi.list({ search: query, page_size: 5 }),
    enabled: query.trim().length >= 2,
    staleTime: 30 * 1000,
  })

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const navigateTo = useCallback((path: string) => {
    onClose()
    router.push(path)
  }, [onClose, router])

  if (!isOpen) return null

  const staticNavItems = [
    { label: 'Executive Overview', icon: <Zap className="h-4 w-4 text-blue-500" />, path: '/overview', section: 'Navigation' },
    { label: 'Opportunity Radar', icon: <Radar className="h-4 w-4 text-emerald-500" />, path: '/radar', section: 'Navigation' },
    { label: 'Opportunity Whitespace', icon: <Layers className="h-4 w-4 text-cyan-500" />, path: '/whitespace', section: 'Intelligence' },
    { label: 'Business DNA Studio', icon: <Fingerprint className="h-4 w-4 text-amber-500" />, path: '/business-dna', section: 'Intelligence' },
    { label: 'Pursuit Workspace', icon: <FolderOpen className="h-4 w-4 text-indigo-500" />, path: '/workspace', section: 'Pursuit' },
    { label: 'Evidence Vault', icon: <Shield className="h-4 w-4 text-purple-500" />, path: '/workspace/evidence', section: 'Pursuit' },
    { label: 'AI Opportunity Analyst', icon: <Bot className="h-4 w-4 text-pink-500" />, path: '/ai-analyst', section: 'Intelligence' },
    { label: 'Settings & Security', icon: <Settings className="h-4 w-4 text-neutral-400" />, path: '/settings', section: 'System' },
  ]

  const filteredNav = query.trim()
    ? staticNavItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
    : staticNavItems

  const opportunities = searchResults?.data || []

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border)] gap-3">
          <Search className="h-5 w-5 text-blue-500 shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent text-[var(--text-1)] placeholder-[var(--text-3)] text-base outline-none font-medium"
            placeholder="Search opportunities, buyers, pages, or tools... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-md hover:bg-[var(--bg)] text-[var(--text-3)]">
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="text-[11px] px-2 py-0.5 rounded border border-[var(--border)] text-[var(--text-3)] font-mono">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-3 space-y-4">
          {/* Opportunities Matches if query */}
          {query.trim().length >= 2 && opportunities.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)] px-3 mb-1.5">
                Opportunities ({opportunities.length})
              </p>
              <div className="space-y-1">
                {opportunities.map((opp) => (
                  <button
                    key={opp.id}
                    onClick={() => navigateTo(`/radar/${opp.id}`)}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--bg)] group transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-sm font-semibold text-[var(--text-1)] truncate group-hover:text-blue-500">
                        {opp.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-2)] mt-0.5">
                        <span className="truncate max-w-[180px]">{opp.organization_name}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500">
                          {opp.category}
                        </span>
                        {opp.value_display && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-emerald-500">{opp.value_display}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--text-3)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Core Navigation Options */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)] px-3 mb-1.5">
              Command Palette & Pages
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {filteredNav.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className="text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg)] group transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[var(--bg)] group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-1)] group-hover:text-blue-500 truncate">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">
                      {item.section}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-3)]">
          <span>Tip: Press <kbd className="px-1 py-0.5 rounded border border-[var(--border)] font-mono">Ctrl+K</kbd> anywhere to open</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Grounded in verified Business DNA
          </span>
        </div>
      </div>
    </div>
  )
}
