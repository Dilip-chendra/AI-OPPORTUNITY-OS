'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How does OpportunityOS discover and index opportunities?',
      a: 'We continuously monitor over 50,000 public and private portals including central government e-procurement registries, state tender boards, Ministry of MSME, Startup India schemes, multilateral development banks (World Bank, ADB), corporate vendor registries, and academic research grant directories.',
    },
    {
      q: 'How does the 8-Dimension quantitative scoring engine operate?',
      a: 'When you create your Business DNA, we index your technical capabilities, past contract values, certifications (ISO, CMMI, MSME), geographical reach, and registrations. When an opportunity is parsed, our engine evaluates criteria match, turnover thresholds, location eligibility, and past performance alignment to assign an objective fit score from 0-100%.',
    },
    {
      q: 'Is synthetic demo data kept strictly isolated from real data?',
      a: 'Yes, 100%. We enforce strict platform-level tenant isolation. Demo records are clearly tagged and never mixed with production registries or production organization workspaces.',
    },
    {
      q: 'Can our bidding team collaborate inside the platform?',
      a: 'Yes. Our Pursuit Studio allows your business development team to track bidding stages on a Kanban pipeline, assign owners, audit clause-level compliance checklists, and collaborate with our AI Opportunity Analyst to draft technical proposals.',
    },
    {
      q: 'Do you support international and multilateral tenders?',
      a: 'Yes. In addition to comprehensive India coverage (Central & State tenders, GeM, MSME subsidies), we track international procurement from multilateral bodies (UN, World Bank) and cross-border innovation schemes (EU Horizon Europe).',
    },
  ]

  return (
    <section id="faq" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">12 // FAQ</span>
          <span>•</span>
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--text-1)]">
          Technical specifications & FAQ.
        </h2>

        <p className="text-sm sm:text-base text-[var(--text-2)] mb-12 leading-relaxed">
          Everything you need to know about the OpportunityOS data architecture and bidding engine.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full p-5 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-[var(--text-1)] hover:text-cyan-500 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    open === i ? 'rotate-180 text-cyan-500' : 'text-[var(--text-3)]'
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-xs sm:text-sm leading-relaxed text-[var(--text-2)] border-t border-[var(--border)] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

