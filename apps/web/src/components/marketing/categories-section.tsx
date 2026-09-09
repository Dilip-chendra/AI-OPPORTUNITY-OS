'use client'
import Link from 'next/link'
import { Building2, Wallet, Briefcase, Globe, Handshake, Lightbulb, FlaskConical, ArrowUpRight } from 'lucide-react'

export function CategoriesSection() {
  const categories = [
    { name: 'Government', icon: <Building2 className="h-5 w-5 text-cyan-500" />, href: '/government', desc: 'Central, state, municipal tenders, GeM empanelments, and public sector RFPs.', count: '14,000+' },
    { name: 'Funding & Grants', icon: <Wallet className="h-5 w-5 text-emerald-500" />, href: '/funding', desc: 'MSME subsidies, Startup India schemes, non-dilutive innovation grants.', count: '3,800+' },
    { name: 'Corporate RFPs', icon: <Briefcase className="h-5 w-5 text-amber-500" />, href: '/corporate', desc: 'Enterprise vendor empanelments, supplier portals, and private B2B contracts.', count: '8,900+' },
    { name: 'Global & Exports', icon: <Globe className="h-5 w-5 text-indigo-400" />, href: '/global', desc: 'World Bank, UN, EU Horizon, and international cross-border procurement.', count: '5,100+' },
    { name: 'Partnerships', icon: <Handshake className="h-5 w-5 text-zinc-300" />, href: '/partnerships', desc: 'Co-bidding alliances, consortium invites, and channel partner programs.', count: '1,400+' },
    { name: 'Innovation & Tech', icon: <Lightbulb className="h-5 w-5 text-cyan-400" />, href: '/innovation', desc: 'Hackathons, deep-tech grand challenges, and smart city pilot bids.', count: '2,200+' },
    { name: 'Research Consortia', icon: <FlaskConical className="h-5 w-5 text-rose-400" />, href: '/research', desc: 'University R&D collaborations, tech commercialization grants.', count: '950+' },
  ]

  return (
    <section id="categories" className="py-24 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-3">
              <span className="text-cyan-500 font-bold">CHANNELS</span>
              <span>•</span>
              <span>7 DEDICATED INGESTION STREAMS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-1)] mb-3">
              Explore 7 Specialized Opportunity Channels
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-2)] max-w-2xl leading-relaxed">
              From state municipal tenders to multimillion-dollar international innovation grants, indexed and scored in one place.
            </p>
          </div>
          <Link href="/signup" className="text-xs font-mono font-semibold text-cyan-500 hover:underline inline-flex items-center gap-1">
            Browse all channels <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <Link
              key={i}
              href="/signup"
              className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--text-3)]/40 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="p-2.5 rounded-md bg-[var(--surface)] border border-[var(--border)] w-fit mb-4">
                  {c.icon}
                </div>
                <h3 className="text-sm font-bold mb-1 text-[var(--text-1)] group-hover:text-cyan-500 transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-[var(--text-2)] leading-relaxed mb-4">
                  {c.desc}
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--text-3)]">
                <span>{c.count} active</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

