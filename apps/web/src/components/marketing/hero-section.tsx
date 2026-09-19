'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Play, Database, Cpu, Layers, Activity, CheckCircle2, ShieldCheck, Clock, Building2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/ui/score-ring'

const SAMPLE_OPPORTUNITIES = [
  {
    id: 'opp-1',
    category: 'Government ITMS',
    source: 'GeM Portal · Tel State ITMS #884',
    title: 'AI-Powered Smart City Surveillance & Adaptive Traffic Management',
    issuingOrg: 'Telangana State Infrastructure Authority',
    value: '₹4.80 Cr',
    deadline: '14 days remaining',
    urgency: 'high',
    matchScore: 94,
    recommendation: 'PURSUE',
    recommendationReason: 'Direct match with registered MSME AI capabilities & previous municipal CCTV deployments.',
    dimensions: [
      { name: 'Eligibility', score: 98, weight: '25%' },
      { name: 'Capability Fit', score: 96, weight: '20%' },
      { name: 'Business Fit', score: 92, weight: '15%' },
      { name: 'Value Fit', score: 95, weight: '15%' },
      { name: 'Time Feasibility', score: 90, weight: '10%' },
    ],
  },
  {
    id: 'opp-2',
    category: 'Innovation Grant',
    source: 'BIRAC / DST Deep-Tech Scheme #2026',
    title: 'Autonomous Drone Edge AI for High-Voltage Grid Inspection',
    issuingOrg: 'Department of Science & Technology',
    value: '₹75.0 Lakh',
    deadline: '28 days remaining',
    urgency: 'normal',
    matchScore: 89,
    recommendation: 'PURSUE',
    recommendationReason: 'High research alignment with patent portfolio; 100% grant non-dilutive funding.',
    dimensions: [
      { name: 'Eligibility', score: 95, weight: '25%' },
      { name: 'Capability Fit', score: 92, weight: '20%' },
      { name: 'Business Fit', score: 88, weight: '15%' },
      { name: 'Value Fit', score: 90, weight: '15%' },
      { name: 'Time Feasibility', score: 85, weight: '10%' },
    ],
  },
  {
    id: 'opp-3',
    category: 'Enterprise RFP',
    source: 'Multilateral / World Bank Digital #WB-491',
    title: 'Distributed Cloud Microservices & Identity Mesh Architecture',
    issuingOrg: 'Multilateral Development Bank Group',
    value: '$1,200,000',
    deadline: '21 days remaining',
    urgency: 'normal',
    matchScore: 86,
    recommendation: 'PARTNER',
    recommendationReason: 'Exceeds solo turnover criteria by 15%; strong recommendation to bid via consortium.',
    dimensions: [
      { name: 'Eligibility', score: 78, weight: '25%' },
      { name: 'Capability Fit', score: 96, weight: '20%' },
      { name: 'Business Fit', score: 94, weight: '15%' },
      { name: 'Value Fit', score: 84, weight: '15%' },
      { name: 'Time Feasibility', score: 88, weight: '10%' },
    ],
  },
]

export function HeroSection() {
  const [selectedOpp, setSelectedOpp] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    setMounted(true)
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4)
    }, 2800)
    return () => clearInterval(stepInterval)
  }, [])

  const current = SAMPLE_OPPORTUNITIES[selectedOpp]

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[var(--bg)]">
      {/* Subtle Telemetry Grid Background - Visible & crisp in both Light and Dark mode */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_15%,#000_75%,transparent_100%)] pointer-events-none" />

      {/* Atmospheric Ambient Glow behind Hero */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-indigo-500/10 dark:from-cyan-500/20 dark:via-blue-500/15 dark:to-purple-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Status Line */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-2)] text-[11px] font-mono font-medium shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">OPPORTUNITY INTELLIGENCE / LIVE SIGNAL MATRIX</span>
          </div>
        </div>

        {/* Master Headline - Zero awkward gap */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-1)] leading-[1.08]">
            Find the opportunities <br />
            your business is built to <span className="text-cyan-500 underline decoration-cyan-500/30 underline-offset-8">win.</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-center max-w-2xl mx-auto text-[var(--text-2)] mb-10 leading-relaxed">
          OpportunityOS continuously discovers government tenders, funding programs, corporate RFPs, and global grants — using mathematical AI to identify exactly what is worth pursuing.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              variant="signal"
              size="lg"
              className="w-full sm:w-auto h-12 px-7 text-xs font-semibold uppercase tracking-wider"
              rightIcon={<ArrowUpRight className="h-4 w-4" />}
            >
              Explore Opportunities
            </Button>
          </Link>
          <a href="#radar" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto h-12 px-6 text-xs font-semibold uppercase tracking-wider"
              leftIcon={<Play className="h-3.5 w-3.5 fill-current text-cyan-500" />}
            >
              Watch System Work
            </Button>
          </a>
        </div>

        {/* LIVE INTERACTIVE PRODUCT INTELLIGENCE CONSOLE */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden">
          {/* Terminal Titlebar */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface-elevated)] gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono font-medium text-[var(--text-2)] tracking-wider">
                RADAR_TELEMETRY_ENGINE.EXE
              </span>
            </div>

            {/* Ingestion Stream Indicators */}
            <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-3)]">
              <div className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-cyan-500" />
                <span className="text-[var(--text-2)]">50,000+ Sources Indexed</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-Time Stream Active</span>
              </div>
            </div>
          </div>

          {/* Interactive Opportunity Switcher Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/50">
            {SAMPLE_OPPORTUNITIES.map((opp, idx) => (
              <button
                key={opp.id}
                onClick={() => setSelectedOpp(idx)}
                className={`text-left p-4 transition-colors border-r last:border-r-0 border-[var(--border)] cursor-pointer ${
                  selectedOpp === idx
                    ? 'bg-[var(--surface)] border-b-2 border-b-cyan-500 text-[var(--text-1)]'
                    : 'text-[var(--text-2)] hover:bg-[var(--surface)]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--border)] text-[var(--text-2)]">
                    {opp.category}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-cyan-500">
                    Match {opp.matchScore}%
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-1)] truncate mt-1">
                  {opp.title}
                </p>
                <p className="text-[11px] font-mono text-[var(--text-3)] mt-0.5">
                  {opp.value} • {opp.deadline}
                </p>
              </button>
            ))}
          </div>

          {/* Live Analysis Display */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Opportunity Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-3)]">
                <span>{current.source}</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Official Notice
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-1)] leading-snug">
                {current.title}
              </h2>

              <p className="text-xs font-medium text-[var(--text-2)] flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-[var(--text-3)]" />
                {current.issuingOrg}
              </p>

              {/* Rationale Callout */}
              <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] space-y-1">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-[11px] font-mono font-bold uppercase text-[var(--text-2)] tracking-wider">
                    AI MATCH RATIONALE
                  </span>
                </div>
                <p className="text-xs text-[var(--text-1)] leading-relaxed">
                  {current.recommendationReason}
                </p>
              </div>

              {/* Pipeline Step Indicators */}
              <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-[var(--text-3)] overflow-x-auto pb-1">
                {['01. Ingested', '02. DNA Match', '03. 8-Dim Math', '04. Decision'].map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className={`px-2.5 py-1 rounded border flex items-center gap-1.5 shrink-0 ${
                      activeStep === sIdx
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-500 font-semibold'
                        : 'border-[var(--border)] text-[var(--text-3)]'
                    }`}
                  >
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: 8-Dimension Quantitative Math Breakdown */}
            <div className="lg:col-span-5 p-5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <ScoreRing score={current.matchScore} size="md" />
                  <div>
                    <span className="block text-[10px] font-mono font-bold uppercase text-[var(--text-3)]">
                      AI RECOMMENDATION
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-extrabold uppercase ${
                        current.recommendation === 'PURSUE'
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {current.recommendation}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-mono text-[var(--text-3)] uppercase">
                    EST. VALUE
                  </span>
                  <span className="font-mono text-base font-bold text-[var(--text-1)]">
                    {current.value}
                  </span>
                </div>
              </div>

              {/* Dimension Bars */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-3)] tracking-wider block">
                  QUANTITATIVE DIMENSIONS (8-DIM ENGINE)
                </span>
                {current.dimensions.map((dim, dIdx) => (
                  <div key={dIdx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-[var(--text-2)]">{dim.name}</span>
                      <span className="text-[var(--text-1)] font-semibold">{dim.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href="/signup" className="block">
                  <Button variant="primary" size="sm" className="w-full text-xs font-semibold">
                    Launch Pursuit Workspace →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

