'use client'
import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-14 text-xs text-[var(--text-3)]">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 space-y-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-[var(--text-1)]">
            <div className="h-7 w-7 rounded-md bg-zinc-900 border border-zinc-700/50 dark:bg-zinc-100 dark:border-white/30 flex items-center justify-center text-white dark:text-zinc-950">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3 3" />
                <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.75" />
                <path d="M12 3V7M12 17V21M3 12H7M17 12H21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </div>
            <span>Opportunity<span className="text-cyan-500 font-extrabold">OS</span></span>
          </Link>
          <p className="max-w-sm text-xs leading-relaxed text-[var(--text-2)]">
            The intelligence layer for business opportunities. Continuously discovering, qualifying, and capturing high-value contracts and grants.
          </p>
          <p className="text-[11px] text-cyan-500 font-mono font-semibold uppercase tracking-widest">
            Discover. Decide. Capture.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-[var(--text-1)] mb-3">Intelligence</h4>
          <ul className="space-y-2">
            <li><a href="#radar" className="hover:text-[var(--text-1)] transition-colors">Opportunity Radar</a></li>
            <li><a href="#decision-engine" className="hover:text-[var(--text-1)] transition-colors">Decision Engine</a></li>
            <li><a href="#ai-analyst" className="hover:text-[var(--text-1)] transition-colors">AI Analyst</a></li>
            <li><a href="#change-radar" className="hover:text-[var(--text-1)] transition-colors">Change Radar</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-[var(--text-1)] mb-3">Channels</h4>
          <ul className="space-y-2">
            <li><Link href="/government" className="hover:text-[var(--text-1)] transition-colors">Government Tenders</Link></li>
            <li><Link href="/funding" className="hover:text-[var(--text-1)] transition-colors">Innovation Grants</Link></li>
            <li><Link href="/corporate" className="hover:text-[var(--text-1)] transition-colors">Corporate RFPs</Link></li>
            <li><Link href="/global" className="hover:text-[var(--text-1)] transition-colors">Global & Multilateral</Link></li>
            <li><Link href="/partnerships" className="hover:text-[var(--text-1)] transition-colors">Partner Network</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-[var(--text-1)] mb-3">Platform</h4>
          <ul className="space-y-2">
            <li><Link href="/login" className="hover:text-[var(--text-1)] transition-colors">Sign In</Link></li>
            <li><Link href="/signup" className="hover:text-[var(--text-1)] transition-colors">Create Free Account</Link></li>
            <li><Link href="/overview" className="hover:text-[var(--text-1)] transition-colors">Command Center</Link></li>
            <li><Link href="/workspace" className="hover:text-[var(--text-1)] transition-colors">Pursuit Studio</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} OpportunityOS. All rights reserved.</p>
        <div className="flex items-center gap-6 text-[11px] text-[var(--text-3)]">
          <span className="hover:text-[var(--text-2)] cursor-pointer">Enterprise Privacy Protocol</span>
          <span className="hover:text-[var(--text-2)] cursor-pointer">Terms of Service</span>
          <span className="hover:text-[var(--text-2)] cursor-pointer">Source Verification Registry</span>
        </div>
      </div>
    </footer>
  )
}

