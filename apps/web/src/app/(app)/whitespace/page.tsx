'use client'
import { useQuery } from '@tanstack/react-query'
import { intelligenceApi } from '@/lib/api/intelligence'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Layers, Sparkles, TrendingUp, Building2, ArrowRight, 
  Shield, CheckCircle2, AlertCircle, Compass, Sliders, ExternalLink
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

export default function WhitespacePage() {
  const router = useRouter()

  const { data: whitespace, isLoading } = useQuery({
    queryKey: ['opportunity-whitespace'],
    queryFn: intelligenceApi.getWhitespace,
  })

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="skeleton h-8 w-64 rounded-xl" />
        <div className="skeleton h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  const uncontested = whitespace?.uncontested_opportunities || []
  const adjacent = whitespace?.adjacent_opportunities || []
  const buyers = whitespace?.underserved_buyers || []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[var(--text-1)]">
                Opportunity Whitespace Engine
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Grounded in Business DNA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-2)] mt-0.5">
              Uncontested market sectors, capability gaps, and adjacent growth vectors matched to {whitespace?.company_name || 'your enterprise'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => router.push('/business-dna')}>
            Review Business DNA
          </Button>
          <Button size="sm" variant="default" onClick={() => router.push('/radar')}>
            Open Radar
          </Button>
        </div>
      </div>

      {/* Strategic Summary Banner */}
      {whitespace?.strategic_summary && (
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="h-4 w-4" />
            AI Strategic Growth Advisory
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--surface)] p-3.5 rounded-xl border border-[var(--border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block mb-1">
                Primary Expansion Vector
              </span>
              <p className="text-xs font-semibold text-[var(--text-1)] leading-relaxed">
                {whitespace.strategic_summary.primary_growth_vector}
              </p>
            </div>
            <div className="bg-[var(--surface)] p-3.5 rounded-xl border border-[var(--border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block mb-1">
                Readiness Unlock Opportunity
              </span>
              <p className="text-xs font-semibold text-emerald-400 leading-relaxed">
                {whitespace.strategic_summary.readiness_unlock}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Three Whitespace Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Uncontested High-Fit Deals */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text-1)] flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Uncontested High-Fit Opportunities ({uncontested.length})
              </h2>
              <p className="text-xs text-[var(--text-2)] mt-0.5">
                Strong capability match from your Business DNA with zero applications or pipeline pursuit yet.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {uncontested.length === 0 ? (
              <p className="text-xs text-[var(--text-3)] py-6 text-center">No uncontested opportunities found.</p>
            ) : (
              uncontested.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-cyan-500/50 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 mr-2">
                        {item.category}
                      </span>
                      <span className="text-xs text-[var(--text-2)]">{item.organization_name}</span>
                      <h3
                        onClick={() => router.push(`/radar/${item.id}`)}
                        className="font-bold text-sm text-[var(--text-1)] hover:text-blue-500 cursor-pointer mt-1"
                      >
                        {item.title}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-bold text-emerald-400 block">{item.value_display}</span>
                      {item.deadline && (
                        <span className="text-[10px] text-[var(--text-3)] font-mono">
                          Closes: {new Date(item.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.matching_capabilities && item.matching_capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center pt-2 border-t border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-3)] mr-1">Matched DNA:</span>
                      {item.matching_capabilities.map((cap, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                          ✓ {cap}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      onClick={() => router.push(`/radar/${item.id}`)}
                    >
                      Analyze Opportunity
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pillar 2 & 3 Right Column */}
        <div className="space-y-6">
          {/* Adjacent Opportunities */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <div className="border-b border-[var(--border)] pb-3">
              <h2 className="text-base font-bold text-[var(--text-1)] flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-400" />
                Adjacent Opportunities ({adjacent.length})
              </h2>
              <p className="text-xs text-[var(--text-2)] mt-0.5">
                High-value bids requiring just 1 credential or partnership unlock.
              </p>
            </div>

            <div className="space-y-3">
              {adjacent.length === 0 ? (
                <p className="text-xs text-[var(--text-3)] py-4 text-center">No adjacent gaps detected.</p>
              ) : (
                adjacent.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => router.push(`/radar/${item.id}`)}
                        className="text-xs font-bold text-[var(--text-1)] hover:text-blue-500 cursor-pointer line-clamp-1"
                      >
                        {item.title}
                      </h4>
                      <span className="text-xs font-mono text-emerald-400 shrink-0">{item.value_display}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400">
                      <strong className="block text-[10px] uppercase tracking-wider text-amber-500">Missing Credential:</strong>
                      {item.missing_credential}
                    </div>
                    <p className="text-[11px] text-[var(--text-2)]">
                      <strong className="text-[var(--text-1)]">Strategy: </strong>{item.unlock_strategy}
                    </p>
                    <div className="pt-1 flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        rightIcon={<Sliders className="h-3 w-3 text-blue-400" />}
                        onClick={() => router.push(`/radar/${item.id}`)}
                      >
                        Simulate Teaming
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Underserved Buyers */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <div className="border-b border-[var(--border)] pb-3">
              <h2 className="text-base font-bold text-[var(--text-1)] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-400" />
                Underserved Buyers ({buyers.length})
              </h2>
              <p className="text-xs text-[var(--text-2)] mt-0.5">
                Top procurement authorities actively buying what you deliver.
              </p>
            </div>

            <div className="space-y-3">
              {buyers.map((b, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--text-1)]">{b.buyer_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {b.open_tenders_count} tenders
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-2)]">{b.strategic_recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
