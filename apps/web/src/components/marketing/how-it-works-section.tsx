'use client'
import { FolderOpen, FileCheck2, Sparkles, CheckSquare, Send, Award, Layers, ShieldCheck } from 'lucide-react'

export function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Radar Intake', desc: 'Notice indexed from registry & parsed into structured JSON.', icon: <Layers className="h-4 w-4 text-cyan-500" /> },
    { num: '02', title: 'Compliance Matrix', desc: 'Clause-by-clause requirements mapped directly to credentials.', icon: <FileCheck2 className="h-4 w-4 text-emerald-500" /> },
    { num: '03', title: 'Document Vault', desc: 'Audited filings, GST, and ISO certificates attached automatically.', icon: <CheckSquare className="h-4 w-4 text-cyan-400" /> },
    { num: '04', title: 'Proposal Studio', desc: 'AI drafts executive summary, technical approach & commercial terms.', icon: <Sparkles className="h-4 w-4 text-indigo-400" /> },
    { num: '05', title: 'Review & Signoff', desc: 'Engineering leads sign off on deliverables, margin & milestones.', icon: <ShieldCheck className="h-4 w-4 text-amber-500" /> },
    { num: '06', title: 'Submission Packet', desc: 'Final bid dossier compiled with verifiable compliance index.', icon: <Send className="h-4 w-4 text-zinc-300" /> },
    { num: '07', title: 'Award & Execution', desc: 'Outcome recorded with contract value and PMO handover.', icon: <Award className="h-4 w-4 text-emerald-400" /> },
  ]

  return (
    <section id="workspace" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">06 // EXECUTION PURSUIT STUDIO</span>
          <span>•</span>
          <span>PROPOSAL & COMPLIANCE PIPELINE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--text-1)]">
          From discovery to contract award in one studio.
        </h2>

        <p className="text-sm sm:text-base max-w-3xl text-[var(--text-2)] mb-12 leading-relaxed">
          Discovery is only step one. OpportunityOS provides a dedicated execution workbench for every live deal — clause-level compliance matrices, AI proposal drafting, document checklists, and submission telemetry.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--text-3)]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-500">{s.num}</span>
                  <div className="p-1 rounded bg-[var(--surface)] border border-[var(--border)]">
                    {s.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-1)] mb-1.5">{s.title}</h3>
                <p className="text-[11px] text-[var(--text-2)] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

