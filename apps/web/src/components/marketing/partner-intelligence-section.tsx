'use client'
import { Users, Handshake, ShieldCheck, CheckCircle2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PartnerIntelligenceSection() {
  const partners = [
    {
      role: 'Prime Contractor Lead',
      name: 'L&T Technology Infrastructure',
      capabilities: 'Civil Works, Tier-1 Turnkey Delivery, State Empanelment',
      matchReason: 'Satisfies mandatory 5-year public sector prime experience clause.',
      fitScore: '98% Consortium Fit',
    },
    {
      role: 'Hardware & Sensor OEM',
      name: 'OptiSense Embedded Systems',
      capabilities: 'Edge Cameras, ANPR Radars, Industrial Computing',
      matchReason: 'Fulfills Section 3 mandatory edge telemetry hardware specification.',
      fitScore: '95% Consortium Fit',
    },
    {
      role: 'Cybersecurity Auditor',
      name: 'CyberDefend CERT-In Labs',
      capabilities: 'ISO 27001, SOC2 Type II, Indian CERT-In Empanelment',
      matchReason: 'Provides required third-party cybersecurity clearance certificate.',
      fitScore: '94% Consortium Fit',
    },
  ]

  return (
    <section id="partner-network" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">07 // PARTNER INTELLIGENCE</span>
          <span>•</span>
          <span>CONSORTIUM MATCHING ENGINE</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-1)] mb-3">
              Win larger deals through AI-matched consortiums.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-2)] max-w-2xl leading-relaxed">
              Don't forfeit ₹50Cr+ tenders due to legacy turnover or physical deployment rules. OpportunityOS matches your technical IP with pre-qualified prime contractors to submit compliant joint bids.
            </p>
          </div>
          <Link href="/signup" className="shrink-0">
            <Button variant="signal" size="md" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
              Explore Network
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partners.map((p, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--text-3)]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                    {p.role}
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-500">{p.fitScore}</span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-1)] mb-1">{p.name}</h3>
                <p className="text-xs text-[var(--text-3)] font-mono mb-3">{p.capabilities}</p>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">{p.matchReason}</p>
              </div>

              <div className="pt-4 mt-6 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-500 inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Profile
                </span>
                <Link href="/signup" className="text-cyan-500 hover:underline font-medium">
                  Connect Partner →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

