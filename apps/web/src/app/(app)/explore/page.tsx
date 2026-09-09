'use client'
import Link from 'next/link'
import { Building2, Wallet, Briefcase, Globe, Handshake, Lightbulb, FlaskConical, ArrowRight, Compass } from 'lucide-react'

export default function ExplorePage() {
  const categories = [
    { name: 'Government Procurement', icon: <Building2 className="h-6 w-6 text-blue-500" />, href: '/government', desc: 'Central, State, Municipal tenders, and GeM portal bids.', count: '14,200+ Live' },
    { name: 'Funding & Grants', icon: <Wallet className="h-6 w-6 text-emerald-500" />, href: '/funding', desc: 'MSME innovation schemes, startup funds, and non-dilutive subsidies.', count: '3,800+ Live' },
    { name: 'Corporate RFPs', icon: <Briefcase className="h-6 w-6 text-amber-500" />, href: '/corporate', desc: 'Enterprise procurement rosters, supplier empanelments, and bids.', count: '8,900+ Live' },
    { name: 'Global & Exports', icon: <Globe className="h-6 w-6 text-purple-500" />, href: '/global', desc: 'World Bank, UN, and cross-border multilateral contracts.', count: '5,100+ Live' },
    { name: 'Strategic Partnerships', icon: <Handshake className="h-6 w-6 text-orange-500" />, href: '/partnerships', desc: 'Co-bidding consortia, joint ventures, and alliance calls.', count: '1,400+ Live' },
    { name: 'Innovation Challenges', icon: <Lightbulb className="h-6 w-6 text-cyan-500" />, href: '/innovation', desc: 'Deep-tech hackathons, smart city pilots, and prototype awards.', count: '2,200+ Live' },
    { name: 'Research Consortia', icon: <FlaskConical className="h-6 w-6 text-pink-500" />, href: '/research', desc: 'Academic R&D partnerships and institutional grant calls.', count: '950+ Live' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Explore by Category</h1>
          <p className="text-xs sm:text-sm text-[var(--text-2)]">Browse opportunities across 7 distinct public and enterprise channels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((c, i) => (
          <Link key={i} href={c.href} className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/40 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] w-fit mb-4 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <h3 className="text-base font-bold mb-1 group-hover:text-blue-500 transition-colors text-[var(--text-1)]">{c.name}</h3>
              <p className="text-xs leading-relaxed text-[var(--text-2)] mb-4">{c.desc}</p>
            </div>
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--text-3)]">
              <span>{c.count}</span>
              <ArrowRight className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
