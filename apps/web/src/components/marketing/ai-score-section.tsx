'use client'
import { ScoreRing } from '@/components/ui/score-ring'
import { Progress } from '@/components/ui/progress'
import { Activity, ShieldCheck, Cpu } from 'lucide-react'

export function AIScoreSection() {
  const dimensions = [
    { label: 'Eligibility Score', weight: '25%', value: 96, desc: 'Mandatory ISO certifications, MSME / DPIIT registrations, and incorporation filings.', color: 'green' as const },
    { label: 'Capability Fit', weight: '20%', value: 92, desc: 'Direct technical keyword and deliverable overlap with your historical projects.', color: 'green' as const },
    { label: 'Business Domain Fit', weight: '15%', value: 95, desc: 'Sector alignment in enterprise software, cloud systems, and AI automation.', color: 'green' as const },
    { label: 'Value & Budget Fit', weight: '15%', value: 90, desc: 'Contract value (₹4.8 Cr) matches target single-bid capacity without over-leverage.', color: 'green' as const },
    { label: 'Timeline Feasibility', weight: '10%', value: 85, desc: '14-day submission runway provides adequate time for compliant proposal drafting.', color: 'blue' as const },
    { label: 'Geographic Fit', weight: '5%', value: 100, desc: 'Operating footprint located in the issuing jurisdiction (Telangana State).', color: 'green' as const },
    { label: 'Competition Score', weight: '5%', value: 78, desc: 'Estimated market density: favorable win probability for certified MSMEs.', color: 'blue' as const },
    { label: 'Execution Readiness', weight: '5%', value: 94, desc: 'Team size and senior engineering roster ready to fulfill immediate delivery.', color: 'green' as const },
  ]

  return (
    <section id="ai-score" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">04 // 8-DIMENSION QUANTITATIVE ENGINE</span>
          <span>•</span>
          <span>DETERMINISTIC WEIGHTED MATH</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--text-1)]">
          Predictive math, not guesswork.
        </h2>

        <p className="text-sm sm:text-base max-w-3xl text-[var(--text-2)] mb-12 leading-relaxed">
          OpportunityOS evaluates every opportunity across an 8-dimension quantitative model. If mandatory criteria fail, deterministic score caps prevent false positives — ensuring your team only pursues bids you are built to win.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Summary Card */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm flex flex-col items-center text-center">
            <ScoreRing score={94} size="xl" />
            <span className="inline-block mt-6 px-3 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 uppercase tracking-wider">
              VERDICT: PURSUE (94/100)
            </span>
            <h3 className="font-bold text-lg text-[var(--text-1)] mt-3">Calculated Match Index</h3>
            <p className="text-xs text-[var(--text-2)] mt-2 leading-relaxed">
              Dynamically derived from verified Business DNA credentials, audited balance sheets, and active tender clauses.
            </p>
          </div>

          {/* Right Dimension Bars Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dimensions.map((dim, i) => (
              <div key={i} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-[var(--text-1)]">{dim.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--text-3)]">Weight {dim.weight}</span>
                    <span className="font-mono font-bold text-cyan-500">{dim.value}%</span>
                  </div>
                </div>
                <Progress value={dim.value} max={100} size="sm" color={dim.color} />
                <p className="text-[11px] text-[var(--text-2)] mt-2 leading-relaxed">{dim.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

