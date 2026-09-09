'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ScoreRing } from '@/components/ui/score-ring'
import { Button } from '@/components/ui/button'
import { ShieldCheck, MapPin, ArrowUpRight, Radio, ExternalLink } from 'lucide-react'

const DEMO_OPPS = [
  {
    id: 'demo-1',
    category: 'Government ITMS',
    typeKey: 'government',
    title: 'AI-Powered Smart City Traffic Management & Surveillance System',
    org: 'Telangana State IT Authority',
    location: 'Hyderabad, India',
    value: '₹3.20 Cr',
    deadline: '14 days left',
    score: 95,
    recommendation: 'PURSUE',
    verified: true,
  },
  {
    id: 'demo-2',
    category: 'MSME Grant',
    typeKey: 'funding',
    title: 'MSME Digital Transformation & Deep-Tech Innovation Grant Q4',
    org: 'Ministry of MSME',
    location: 'National, India',
    value: '₹25.0 Lakh',
    deadline: '8 days left',
    score: 92,
    recommendation: 'PURSUE',
    verified: true,
  },
  {
    id: 'demo-3',
    category: 'Corporate RFP',
    typeKey: 'corporate',
    title: 'Enterprise Cloud Migration & Edge Infrastructure Partner RFP',
    org: 'Tata Consultancy Services',
    location: 'Mumbai, India',
    value: '₹85.0 Lakh',
    deadline: '21 days left',
    score: 87,
    recommendation: 'REVIEW',
    verified: true,
  },
  {
    id: 'demo-4',
    category: 'Global Tender',
    typeKey: 'global',
    title: 'Digital Public Infrastructure & Identity Modernization RFP',
    org: 'World Bank Group',
    location: 'International (USD)',
    value: '$1,800,000',
    deadline: '30 days left',
    score: 81,
    recommendation: 'PARTNER',
    verified: true,
  },
]

export function RadarDemoSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredOpps =
    selectedCategory === 'all'
      ? DEMO_OPPS
      : DEMO_OPPS.filter((o) => o.typeKey === selectedCategory)

  return (
    <section id="radar" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">02 // THE RADAR</span>
          <span>•</span>
          <span>AUTONOMOUS DISCOVERY</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-1)] mb-3">
              Thousands of opportunities. One precision radar.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-2)] max-w-2xl leading-relaxed">
              Eliminate portal fatigue. OpportunityOS automatically indexes public registries, multilateral agencies, and enterprise vendor portals, filtering solely for viable matches.
            </p>
          </div>
          <Link href="/signup" className="shrink-0">
            <Button variant="signal" size="md" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
              Open Live Radar
            </Button>
          </Link>
        </div>

        {/* Interactive Radar Interface Shell */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-lg overflow-hidden">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--surface)] gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All Channels' },
                { id: 'government', label: 'Government' },
                { id: 'funding', label: 'Grants & Subsidies' },
                { id: 'corporate', label: 'Corporate RFPs' },
                { id: 'global', label: 'Global / UN' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                      : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-2)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Scanning 50,000+ Sources</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpps.map((opp) => (
              <div
                key={opp.id}
                className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-3)]/40 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-2)] border border-[var(--border)]">
                        {opp.category}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-500 inline-flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    </div>
                    <ScoreRing score={opp.score} size="sm" />
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base text-[var(--text-1)] mb-2 group-hover:text-cyan-500 transition-colors leading-snug">
                    {opp.title}
                  </h3>

                  <p className="text-xs text-[var(--text-2)] mb-4 flex items-center gap-2">
                    <span>{opp.org}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[var(--text-3)]">
                      <MapPin className="h-3 w-3" /> {opp.location}
                    </span>
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-medium text-[var(--text-3)] block">
                      Value
                    </span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-[var(--text-1)]">
                      {opp.value}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono font-medium text-[var(--text-3)] block">
                      Deadline
                    </span>
                    <span className="text-xs font-mono font-semibold text-amber-500">{opp.deadline}</span>
                  </div>

                  <Link href="/signup">
                    <Button size="sm" variant="outline" className="text-xs font-semibold h-8 px-3">
                      Analyze Fit →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

