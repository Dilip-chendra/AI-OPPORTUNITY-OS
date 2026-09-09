'use client'
import { useState } from 'react'
import { Rocket, Factory, Cpu, Globe, Building2, Briefcase, ArrowUpRight, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const AUDIENCES = [
  {
    id: 'startups',
    label: 'Startups & Scaleups',
    icon: <Rocket className="h-4 w-4" />,
    headline: 'Secure non-dilutive capital and first public pilots',
    desc: 'Filter 3,800+ grant programs, DPIIT seed funds, and incubator challenges specifically designed for early-stage deep-tech companies.',
    examples: ['DPIIT Startup Seed Fund (₹50L)', 'Nasscom AI Cohort', 'BIRAC BIG Deep-Tech Grant'],
    metric: '100% Non-Dilutive Capital',
  },
  {
    id: 'smes',
    label: 'MSMEs & Manufacturers',
    icon: <Factory className="h-4 w-4" />,
    headline: 'Win state tenders with preferential MSME exemptions',
    desc: 'Capitalize on mandatory 25% public procurement quotas and Earnest Money Deposit (EMD) waivers across GeM and state portals.',
    examples: ['GeM Vendor Empanelments', 'MSME Digital Subsidies (₹25L)', 'State Municipal Tenders'],
    metric: 'EMD & Prior Turnover Exemptions',
  },
  {
    id: 'tech',
    label: 'Technology Providers',
    icon: <Cpu className="h-4 w-4" />,
    headline: 'Capture high-margin ITMS, cloud, and AI contracts',
    desc: 'Receive instant notifications when municipal smart cities, state IT departments, or defense ministries publish software and telemetry RFPs.',
    examples: ['Smart City ITMS Contracts (₹4.8 Cr+)', 'Cloud Migration Rosters', 'Cybersecurity Audits'],
    metric: 'High-Margin Technical Delivery',
  },
  {
    id: 'exporters',
    label: 'Exporters & Global',
    icon: <Globe className="h-4 w-4" />,
    headline: 'Compete in multilateral cross-border procurement',
    desc: 'Access World Bank, UN Global Marketplace, and bilateral developmental tenders billed in USD and EUR.',
    examples: ['World Bank Digital Public Infra ($1.8M)', 'EU Horizon Europe Grants', 'ADB Smart Energy'],
    metric: 'Global Multilateral Reach',
  },
  {
    id: 'enterprises',
    label: 'Enterprise Primes',
    icon: <Building2 className="h-4 w-4" />,
    headline: 'Manage multi-bid pipelines & find consortium partners',
    desc: 'Equip your corporate bidding PMO with 8-dimension win probability analytics and verified subcontractor matching.',
    examples: ['Tata & Reliance Vendor Rosters', 'Turnkey EPC Consortiums', 'State Infrastructure Bids'],
    metric: 'Multi-Crore Pipeline Valuation',
  },
  {
    id: 'consultants',
    label: 'Advisory & Bid PMOs',
    icon: <Briefcase className="h-4 w-4" />,
    headline: 'Scale client bid preparation with AI proposal drafters',
    desc: 'Generate clause-by-clause compliance matrices and technical proposal drafts in minutes for multiple client portfolios.',
    examples: ['Advisory Bid Management', 'Government Relations PMO', 'Consortium Strategy'],
    metric: '10x Faster Proposal Compilation',
  },
]

export function UseCasesSection() {
  const [activeId, setActiveId] = useState('tech')
  const current = AUDIENCES.find((a) => a.id === activeId) || AUDIENCES[0]

  return (
    <section id="solutions" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">10 // AUDIENCE MATRIX</span>
          <span>•</span>
          <span>CALIBRATED FOR YOUR GROWTH OBJECTIVE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--text-1)]">
          Calibrated for opportunity-driven organizations.
        </h2>

        <p className="text-sm sm:text-base max-w-3xl text-[var(--text-2)] mb-12 leading-relaxed">
          Whether you are an agile deep-tech startup or an enterprise infrastructure contractor, OpportunityOS tunes its 8-dimension matching index to your exact growth objectives.
        </p>

        {/* Audience Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {AUDIENCES.map((aud) => (
            <button
              key={aud.id}
              onClick={() => setActiveId(aud.id)}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                activeId === aud.id
                  ? 'border-cyan-500/60 bg-[var(--surface-elevated)] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-3)]/30'
              }`}
            >
              <div className={`p-1 rounded w-fit mb-2 ${activeId === aud.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-[var(--text-3)]'}`}>
                {aud.icon}
              </div>
              <p className="font-semibold text-xs text-[var(--text-1)]">{aud.label}</p>
            </button>
          ))}
        </div>

        {/* Active Solution Explainer Card */}
        <div className="p-6 sm:p-8 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="space-y-4 flex-1">
            <span className="text-xs font-mono font-bold text-cyan-500 uppercase tracking-wider block">
              {current.metric}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-1)]">{current.headline}</h3>
            <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed max-w-3xl">{current.desc}</p>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono font-semibold text-[var(--text-3)] uppercase block">
                Representative Opportunity Streams:
              </span>
              <div className="flex flex-wrap gap-2">
                {current.examples.map((ex, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded text-xs font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] inline-flex items-center gap-1.5"
                  >
                    <Check className="h-3 w-3 text-cyan-500" /> {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link href="/signup" className="block w-full">
              <Button variant="signal" size="md" className="w-full md:w-auto" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
                Build Business DNA →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

