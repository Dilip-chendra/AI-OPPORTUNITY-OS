'use client'
import { useState } from 'react'
import { Terminal, Bot, User, Sparkles, Cpu, ShieldCheck, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const CONVERSATIONS = [
  {
    q: 'Which opportunities should our team pursue this week?',
    a: `Evaluation based on verified Business DNA (AI Systems, ISO 9001, MSME registered):

1. **Telangana Smart City ITMS Tender (₹4.80 Cr)** — 94% Match Fit
   - *Rationale:* Direct correlation with Computer Vision & Municipal CCTV track record.
   - *Timeline:* 14 days remaining — optimal drafting window.
   - *Verdict:* PURSUE. Recommended immediate initiation of Section 2 (Technical Architecture).

2. **BIRAC Deep-Tech Innovation Grant (₹75 Lakh)** — 89% Match Fit
   - *Rationale:* High research alignment with registered patents; 100% non-dilutive grant funding.
   - *Verdict:* PURSUE. Compliance checklist ready for export.`,
  },
  {
    q: 'What non-dilutive grant schemes are open for early-stage deep tech?',
    a: `Scanning active national and multilateral grant registries:

• **DPIIT Startup India Seed Fund Scheme (₹20L - ₹50L)**: Prototype development & commercial validation.
• **BIRAC BIG Grant (₹50L - ₹75L)**: Deep-tech, healthcare AI & IoT commercialization.
• **MeitY TIDE 2.0 Incubation Grant (₹7L - ₹30L)**: Software & robotics IP development.

All listed programs confer preferential MSME scoring criteria with zero equity dilution.`,
  },
  {
    q: 'Are we eligible for the World Bank South Asia procurement notice?',
    a: `Statutory eligibility audit against World Bank guidelines:

✓ Registered legal entity (>2 years commercial history)
✓ Audited balance sheets satisfy baseline turnover criteria
⚠ Notice mandates consortium participation if prime bidder lacks 5+ years multilateral experience.

*Strategic Verdict:* **PARTNER**. Recommended to submit joint bid with a pre-qualified prime contractor.`,
  },
]

export function AIAnalystPreviewSection() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const currentConv = CONVERSATIONS[selectedIdx]

  return (
    <section id="ai-analyst" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">05 // AI ANALYST TERMINAL</span>
          <span>•</span>
          <span>GROUNDED BIDDING INTELLIGENCE</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-1)] mb-3">
              An intelligent co-pilot for bidding strategy.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-2)] max-w-2xl leading-relaxed">
              Ask natural language questions about your opportunity pipeline, qualification criteria, margin optimization, and consortium partners — grounded strictly in source data.
            </p>
          </div>
          <Link href="/signup" className="shrink-0">
            <Button variant="signal" size="md" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
              Open AI Analyst
            </Button>
          </Link>
        </div>

        {/* Prompt Selector Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CONVERSATIONS.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                selectedIdx === i
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                  : 'border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-2)] hover:text-[var(--text-1)]'
              }`}
            >
              "{c.q}"
            </button>
          ))}
        </div>

        {/* Terminal Chat Window */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-lg overflow-hidden">
          {/* Window Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-500" />
              <span className="text-xs font-mono font-medium text-[var(--text-2)]">
                AI_ANALYST_CONSOLE // ACTIVE_SESSION
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Grounded in Source Data
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* User Query */}
            <div className="flex items-start justify-end gap-3">
              <div className="bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 p-3.5 rounded-lg text-xs sm:text-sm font-medium max-w-xl">
                {currentConv.q}
              </div>
              <div className="h-7 w-7 rounded-md bg-[var(--border)] text-[var(--text-2)] flex items-center justify-center shrink-0 text-xs font-mono">
                YOU
              </div>
            </div>

            {/* AI Response */}
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-mono">
                AI
              </div>
              <div className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] p-5 rounded-lg text-xs sm:text-sm leading-relaxed max-w-3xl whitespace-pre-line font-normal">
                {currentConv.a}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

