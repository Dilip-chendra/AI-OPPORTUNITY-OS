'use client'
import { Database, ShieldCheck, Cpu, DollarSign, AlertTriangle, TrendingUp, Target, ArrowRight } from 'lucide-react'

export function ProductVisionSection() {
  const pipeline = [
    { num: '01', title: 'Raw Ingestion', desc: 'Continuous feeds from 50,000+ public tenders & grants.', icon: <Database className="h-4 w-4 text-cyan-500" /> },
    { num: '02', title: 'Eligibility', desc: 'Rule-based verification of turn-over & certifications.', icon: <ShieldCheck className="h-4 w-4 text-emerald-500" /> },
    { num: '03', title: 'Capability Fit', desc: 'Vector comparison with past deliverables & team DNA.', icon: <Cpu className="h-4 w-4 text-cyan-400" /> },
    { num: '04', title: 'Economics', desc: 'Margin viability, currency parity, and budget sanity.', icon: <DollarSign className="h-4 w-4 text-zinc-300" /> },
    { num: '05', title: 'Risk Modeling', desc: 'Corrigendum frequency, legal hurdles & timeline feasibility.', icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
    { num: '06', title: 'Win Probability', desc: 'Historical award modeling & consortium density.', icon: <TrendingUp className="h-4 w-4 text-indigo-400" /> },
    { num: '07', title: 'Decision', desc: 'Actionable classification: PURSUE, REVIEW, PARTNER, SKIP.', icon: <Target className="h-4 w-4 text-emerald-400" /> },
  ]

  return (
    <section id="transformation" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">03 // THE INTELLIGENCE PIPELINE</span>
          <span>•</span>
          <span>FROM UNSTRUCTURED NOTICE TO PREDICTED WIN</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--text-1)]">
          Raw opportunity becomes structured intelligence.
        </h2>

        <p className="text-sm sm:text-base max-w-3xl text-[var(--text-2)] mb-12 leading-relaxed">
          OpportunityOS transforms unindexed PDFs and 80-page RFPs into high-precision quantitative intelligence across 7 deterministic evaluation gates.
        </p>

        {/* 7 Horizontal Pipeline Gates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {pipeline.map((item, idx) => (
            <div
              key={item.num}
              className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--text-3)]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-500">{item.num}</span>
                  <div className="p-1 rounded bg-[var(--surface)] border border-[var(--border)]">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-1)] mb-1.5">{item.title}</h3>
                <p className="text-[11px] text-[var(--text-2)] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

