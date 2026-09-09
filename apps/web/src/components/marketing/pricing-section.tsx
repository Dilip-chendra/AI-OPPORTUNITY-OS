'use client'
import Link from 'next/link'
import { Check, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PricingSection() {
  const tiers = [
    {
      name: 'Starter',
      price: '₹0',
      period: '/ forever',
      desc: 'For solo entrepreneurs discovering initial MSME grants and government schemes.',
      features: [
        'Up to 10 opportunity matches/month',
        'Basic Business DNA profile',
        'Public tender discovery',
        'Standard email alerts',
        '1 user seat',
      ],
      buttonText: 'Start Free Account',
      variant: 'outline' as const,
      popular: false,
    },
    {
      name: 'Professional',
      price: '₹2,999',
      period: '/ month',
      desc: 'For active bidding SMEs, tech contractors, and funded scaleups expanding pipeline.',
      features: [
        'Unlimited opportunity discovery',
        '8-dimension AI Match scoring',
        'Full GeM & public tender monitoring',
        'Instant WhatsApp & Email alerts',
        'AI Opportunity Analyst terminal',
        '3 team seats',
      ],
      buttonText: 'Start 14-Day Free Trial',
      variant: 'signal' as const,
      popular: true,
    },
    {
      name: 'Enterprise PMO',
      price: '₹7,999',
      period: '/ month',
      desc: 'For corporations, consortia, and large agencies managing multi-crore pursuits.',
      features: [
        'Everything in Professional',
        'Dedicated corporate RFP radar',
        'Consortium co-bidding network',
        'Application workspace & proposal studio',
        'Custom compliance checklist generation',
        'Unlimited team seats & API access',
      ],
      buttonText: 'Deploy Enterprise Suite',
      variant: 'primary' as const,
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 border-t border-[var(--border)] bg-[var(--surface)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[var(--text-3)] mb-4">
          <span className="text-cyan-500 font-bold">11 // PRICING</span>
          <span>•</span>
          <span>TRANSPARENT VALUE METRICS</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-1)] mb-3">
              Predictable pricing for high-stakes growth.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-2)] max-w-2xl leading-relaxed">
              Software intelligence that pays for itself with a single awarded contract or non-dilutive grant.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((t, i) => (
            <div
              key={i}
              className={`p-6 sm:p-8 rounded-xl border flex flex-col justify-between relative transition-all ${
                t.popular
                  ? 'border-cyan-500/80 bg-[var(--surface-elevated)] shadow-lg'
                  : 'border-[var(--border)] bg-[var(--surface-elevated)]'
              }`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500 text-zinc-950">
                  RECOMMENDED FOR BIDDING TEAMS
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold mb-1 text-[var(--text-1)]">{t.name}</h3>
                <p className="text-xs text-[var(--text-2)] mb-6 min-h-[32px] leading-relaxed">{t.desc}</p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[var(--border)]">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-[var(--text-1)]">{t.price}</span>
                  <span className="text-xs font-mono text-[var(--text-3)]">{t.period}</span>
                </div>

                <div className="space-y-3 mb-8">
                  {t.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2.5 text-xs text-[var(--text-2)]">
                      <Check className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/signup" className="w-full">
                <Button variant={t.variant} size="md" className="w-full text-xs font-semibold">
                  {t.buttonText} →
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

