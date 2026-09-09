'use client'
import { CalendarClock, ShieldAlert, Sparkles, ArrowUpRight, History } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ChangeRadarSection() {
  const events = [
    {
      time: '12m ago',
      type: 'Corrigendum 02',
      title: 'Telangana Smart City ITMS Tender',
      detail: 'Submission deadline extended by +7 days. Turnover ceiling lowered for registered DPIIT startups.',
      badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    },
    {
      time: '1h ago',
      type: 'Pre-Bid Clarification',
      title: 'National AI Computing Infrastructure Project',
      detail: 'Clarification on Section 4.2: Sovereign cloud deployments across MeitY empaneled data centers verified compliant.',
      badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    },
    {
      time: '3h ago',
      type: 'Budget Revision',
      title: 'BIRAC Deep-Tech Innovation Grant Q4',
      detail: 'Sanction ceiling expanded from ₹50L to ₹75L per awarded applicant enterprise.',
      badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    },
  ]

  return (
    <section id="change-radar" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">08 // CHANGE RADAR</span>
          <span>•</span>
          <span>REAL-TIME NOTICE AMENDMENT TRACKING</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-1)] mb-3">
              Never miss an amendment or corrigendum.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-2)] max-w-2xl leading-relaxed">
              Public tenders change constantly. Change Radar tracks live corrigenda, diffs clause revisions in real time, and alerts your pursuit team when deadlines extend or criteria shift in your favor.
            </p>
          </div>
          <Link href="/signup" className="shrink-0">
            <Button variant="signal" size="md" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
              Configure Alerts
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {events.map((ev, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--text-3)]/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-8 w-8 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-cyan-500 shrink-0 mt-0.5">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${ev.badge}`}>
                      {ev.type}
                    </span>
                    <span className="font-bold text-sm text-[var(--text-1)]">{ev.title}</span>
                  </div>
                  <p className="text-xs text-[var(--text-2)] leading-relaxed">{ev.detail}</p>
                </div>
              </div>

              <div className="shrink-0 font-mono text-xs text-[var(--text-3)]">
                {ev.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

