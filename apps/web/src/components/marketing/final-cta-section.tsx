'use client'
import Link from 'next/link'
import { ArrowUpRight, Terminal, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[var(--surface-elevated)] border-t border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] text-[11px] font-mono font-medium shadow-2xs">
          <Terminal className="h-3.5 w-3.5 text-cyan-500" />
          <span>INITIALIZE YOUR INTELLIGENCE PIPELINE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-1)] leading-[1.12]">
          Stop searching for opportunities. <br />
          Start knowing which ones <span className="text-cyan-500 underline decoration-cyan-500/30 underline-offset-8">matter.</span>
        </h2>

        <p className="text-sm sm:text-base text-[var(--text-2)] max-w-xl mx-auto leading-relaxed">
          Calibrate your Business DNA in 3 minutes. Receive high-probability government, multilateral, and enterprise opportunities directly into your radar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              variant="signal"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-xs font-semibold uppercase tracking-wider"
              rightIcon={<ArrowUpRight className="h-4 w-4" />}
            >
              Enter OpportunityOS
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto h-12 px-6 text-xs font-semibold uppercase tracking-wider"
            >
              Sign In to Dashboard
            </Button>
          </Link>
        </div>

        <div className="pt-6 flex items-center justify-center gap-6 text-[11px] font-mono text-[var(--text-3)] flex-wrap">
          <span>✓ Zero Black Boxes</span>
          <span>•</span>
          <span>✓ 50,000+ Sources Indexed</span>
          <span>•</span>
          <span>✓ Dedicated Tenant Isolation</span>
        </div>
      </div>
    </section>
  )
}

