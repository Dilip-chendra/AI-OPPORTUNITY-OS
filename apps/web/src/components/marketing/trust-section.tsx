'use client'
import { ExternalLink, FileText, Lock, ShieldCheck, Database, Fingerprint } from 'lucide-react'

export function TrustSection() {
  const pillars = [
    {
      title: 'Original Source Preservation',
      desc: 'Every opportunity card retains its permanent external URL directly linking back to the official government portal, tender authority, or enterprise registry. Zero black-box links.',
      icon: <ExternalLink className="h-4 w-4 text-cyan-500" />,
    },
    {
      title: 'Strict Grounding: Facts vs. AI Inference',
      desc: 'We strictly distinguish between statutory facts (deadlines, EMD amounts, turnover thresholds) and predictive match inferences. All AI recommendations cite their governing RFP clause.',
      icon: <FileText className="h-4 w-4 text-blue-400" />,
    },
    {
      title: 'Tenant-Isolated Business DNA',
      desc: 'Your Business DNA, proposal drafts, balance sheets, and pursuit strategies are strictly scoped to your tenant workspace. Data is never shared or used to train global models.',
      icon: <Lock className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: 'Continuous Verification Telemetry',
      desc: 'Autonomous background crawlers re-verify notice validity hourly, immediately flagging expired tenders, budget revisions, and tender amendments.',
      icon: <ShieldCheck className="h-4 w-4 text-indigo-400" />,
    },
  ]

  return (
    <section id="trust" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">09 // TRUST & AUDITABILITY</span>
          <span>•</span>
          <span>NO BLACK BOXES · ZERO FAKE CLAIMS</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--text-1)]">
          Built for high-stakes business decisions.
        </h2>

        <p className="text-sm sm:text-base max-w-3xl text-[var(--text-2)] mb-12 leading-relaxed">
          High-value procurement and capital grants demand rigorous auditability. We don't use fake customer logos or fabricated statistics — we establish trust through verifiable source links, mathematical explainability, and multi-tenant security.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--text-3)]/40 transition-colors flex items-start gap-4"
            >
              <div className="p-2.5 rounded-md bg-[var(--surface)] border border-[var(--border)] shrink-0">
                {p.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-1)] mb-1.5">{p.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

