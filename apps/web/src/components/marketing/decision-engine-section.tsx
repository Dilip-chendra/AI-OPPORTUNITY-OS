'use client'
import { useState } from 'react'
import { CheckCircle2, AlertCircle, Users, Eye, Ban, Cpu, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const DECISIONS = [
  {
    id: 'pursue',
    name: 'PURSUE',
    scoreRange: '88% - 100%',
    badgeColor: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    title: 'High-Probability Primary Bid',
    desc: 'Capabilities, mandatory registrations (MSME, DPIIT), and turnover metrics strongly align with buyer specifications. Clear competitive differentiation.',
    action: 'Initialize Pursuit Studio workspace & generate compliance proposal draft.',
  },
  {
    id: 'review',
    name: 'REVIEW',
    scoreRange: '75% - 87%',
    badgeColor: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    icon: <AlertCircle className="h-4 w-4 text-blue-400" />,
    title: 'Promising Match with Boundary Conditions',
    desc: 'General capability fit is exceptional, but one specific technical requirement or security clearance requires engineering team verification.',
    action: 'Assign to technical architect for a 24-hour feasibility audit.',
  },
  {
    id: 'partner',
    name: 'PARTNER',
    scoreRange: '60% - 74%',
    badgeColor: 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
    icon: <Users className="h-4 w-4 text-amber-500" />,
    title: 'Consortium Co-Bidding Recommended',
    desc: 'Your technology matches scope, but issuing body mandates 5+ years prior state delivery experience. Partner with a pre-qualified prime contractor.',
    action: 'Auto-match with complementary prime contractors in the Partner Network.',
  },
  {
    id: 'watch',
    name: 'WATCH',
    scoreRange: '45% - 59%',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    icon: <Eye className="h-4 w-4 text-indigo-400" />,
    title: 'Monitor for Amendments & Corrigenda',
    desc: 'Notice scope is adjacent. Track corrigenda, deadline extensions, or subsequent sub-contracting packages.',
    action: 'Enable Change Radar alerts for notice amendments.',
  },
  {
    id: 'skip',
    name: 'SKIP',
    scoreRange: '< 45% or Hard Disqualification',
    badgeColor: 'bg-red-500/15 text-red-400 border border-red-500/30',
    icon: <Ban className="h-4 w-4 text-red-400" />,
    title: 'Do Not Expend Bidding Resources',
    desc: 'Mandatory statutory criteria unmet or timeline does not support compliant assembly. Deterministic fail-safe prevents wasted engineering hours.',
    action: 'Archived to keep bidding pipeline focused exclusively on winnable deals.',
  },
]

export function DecisionEngineSection() {
  const [activeTab, setActiveTab] = useState('pursue')
  const current = DECISIONS.find((d) => d.id === activeTab) || DECISIONS[0]

  return (
    <section id="decision-engine" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">04 // THE DECISION ENGINE</span>
          <span>•</span>
          <span>DETERMINISTIC ACTION VERDICTS</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--text-1)]">
          Decide in seconds, not days.
        </h2>

        <p className="text-sm sm:text-base max-w-3xl text-[var(--text-2)] mb-12 leading-relaxed">
          Every discovery signal is classified into an actionable strategic verdict. Your pursuit team always knows exactly where to deploy technical capital.
        </p>

        {/* 5-State Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {DECISIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveTab(d.id)}
              className={`p-3.5 rounded-lg border text-center transition-colors cursor-pointer ${
                activeTab === d.id
                  ? 'border-cyan-500/60 bg-[var(--surface-elevated)] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-3)]/30'
              }`}
            >
              <span className={`inline-block px-2 py-0.5 rounded font-mono font-extrabold text-xs mb-1.5 ${d.badgeColor}`}>
                {d.name}
              </span>
              <span className="block font-mono text-[10px] text-[var(--text-3)]">{d.scoreRange}</span>
            </button>
          ))}
        </div>

        {/* Active State Detailed Explainer */}
        <div className="p-6 sm:p-8 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-[var(--surface)] border border-[var(--border)]">
                {current.icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-1)]">{current.title}</h3>
                <span className="text-xs font-mono text-cyan-500">Classification: {current.name} ({current.scoreRange})</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed max-w-4xl">{current.desc}</p>

            <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-1)] flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-500 shrink-0" />
                <span><strong>Recommended Action:</strong> {current.action}</span>
              </div>

              <Link href="/signup">
                <Button variant="signal" size="sm" className="h-8 px-3 text-xs">
                  Experience Simulator →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

