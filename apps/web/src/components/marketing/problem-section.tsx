'use client'
import { AlertCircle, FileSearch, FilterX, Clock, DatabaseZap, Network, ArrowRight } from 'lucide-react'

export function ProblemSection() {
  const painPoints = [
    {
      num: '01',
      title: 'Scattered Silos & Portal Fatigue',
      desc: 'High-value contracts and grants are buried across 5,000+ unindexed state registries, GeM, municipal authorities, and enterprise procurement sites.',
      icon: <DatabaseZap className="h-4 w-4 text-cyan-500" />,
    },
    {
      num: '02',
      title: 'Dense, Opaque Qualification Rules',
      desc: 'RFP documents average 80+ pages of dense legal clauses and hidden mandatory eligibility conditions that take 20+ manual engineer hours to decipher.',
      icon: <FileSearch className="h-4 w-4 text-amber-500" />,
    },
    {
      num: '03',
      title: 'Missed Submission Runways',
      desc: 'By the time your team discovers a relevant tender or innovation scheme, the statutory deadline is days away, making a winning submission impossible.',
      icon: <Clock className="h-4 w-4 text-rose-500" />,
    },
    {
      num: '04',
      title: 'False Positives & Wasted Bids',
      desc: 'Pursuing tenders with unmet turnover or certification thresholds burns critical capital compiling non-compliant, disqualified bids.',
      icon: <FilterX className="h-4 w-4 text-indigo-400" />,
    },
  ]

  return (
    <section id="problem" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">01 // THE SIGNAL</span>
          <span>•</span>
          <span>THE DISCOVERY CRISIS</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-14">
          <div className="lg:col-span-7">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-1)] leading-[1.12]">
              Every day, valuable opportunities disappear into noise.
            </h2>
          </div>
          <div className="lg:col-span-5 text-sm sm:text-base text-[var(--text-2)] leading-relaxed">
            Over ₹100,000 Crore in public tenders, grants, and enterprise contracts are published every quarter. Yet growing companies miss 92% of qualified pursuits due to portal fragmentation and manual evaluation friction.
          </div>
        </div>

        {/* 4 Core Inefficiencies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {painPoints.map((item) => (
            <div
              key={item.num}
              className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--text-3)]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-md bg-[var(--surface)] border border-[var(--border)]">
                    {item.icon}
                  </div>
                  <span className="font-mono text-xs font-semibold text-[var(--text-3)]">{item.num}</span>
                </div>
                <h3 className="font-semibold text-sm text-[var(--text-1)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

