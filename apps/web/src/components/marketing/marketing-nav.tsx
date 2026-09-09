'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Sun, Moon, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] py-3 shadow-sm'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Monogram & Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-700/50 dark:bg-zinc-100 dark:border-white/30 flex items-center justify-center text-white dark:text-zinc-950 transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3 3" />
              <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 3V7M12 17V21M3 12H7M17 12H21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[var(--text-1)]">
                Opportunity<span className="text-cyan-500 font-extrabold">OS</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                LIVE
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium tracking-normal text-[var(--text-2)]">
          <a href="#problem" className="hover:text-[var(--text-1)] transition-colors">Problem</a>
          <a href="#radar" className="hover:text-[var(--text-1)] transition-colors">Radar</a>
          <a href="#decision-engine" className="hover:text-[var(--text-1)] transition-colors">Decision Engine</a>
          <a href="#ai-analyst" className="hover:text-[var(--text-1)] transition-colors">AI Analyst</a>
          <a href="#workspace" className="hover:text-[var(--text-1)] transition-colors">Workspace</a>
          <a href="#partner-network" className="hover:text-[var(--text-1)] transition-colors">Partners</a>
          <a href="#pricing" className="hover:text-[var(--text-1)] transition-colors">Pricing</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-lg flex items-center justify-center border border-[var(--border)] transition-colors hover:bg-[var(--surface-elevated)] text-[var(--text-2)] hover:text-[var(--text-1)]"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-700" />}
            </button>
          )}
          <Link
            href="/login"
            className="hidden sm:inline-flex text-xs font-medium tracking-wide px-3 py-2 text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
          >
            Sign In
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              variant="signal"
              className="h-9 px-4 text-xs font-semibold tracking-wide"
              rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              Get Started
            </Button>
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden h-9 w-9 rounded-lg flex items-center justify-center border border-[var(--border)] text-[var(--text-2)]"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5 mt-2 space-y-4 animate-slide-up shadow-xl">
          <nav className="flex flex-col gap-3 text-sm font-medium text-[var(--text-2)]">
            <a href="#problem" onClick={() => setMobileOpen(false)} className="hover:text-[var(--text-1)] py-1">Problem</a>
            <a href="#radar" onClick={() => setMobileOpen(false)} className="hover:text-[var(--text-1)] py-1">Opportunity Radar</a>
            <a href="#decision-engine" onClick={() => setMobileOpen(false)} className="hover:text-[var(--text-1)] py-1">Decision Engine</a>
            <a href="#ai-analyst" onClick={() => setMobileOpen(false)} className="hover:text-[var(--text-1)] py-1">AI Analyst</a>
            <a href="#workspace" onClick={() => setMobileOpen(false)} className="hover:text-[var(--text-1)] py-1">Pursuit Workspace</a>
            <a href="#partner-network" onClick={() => setMobileOpen(false)} className="hover:text-[var(--text-1)] py-1">Partner Network</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="hover:text-[var(--text-1)] py-1">Pricing</a>
          </nav>
          <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full text-xs font-semibold">Sign In</Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <Button variant="signal" className="w-full text-xs font-semibold">Get Started Free</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

