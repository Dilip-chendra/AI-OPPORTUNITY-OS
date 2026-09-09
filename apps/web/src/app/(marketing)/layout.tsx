import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)' }}>
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  )
}
