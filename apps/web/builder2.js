const fs = require('fs');
const path = require('path');
const baseDir = 'c:\\Users\\admin\\Downloads\\Git Uploads\\AI-OPPORTUNITY-OS\\apps\\web';

function write(file, content) {
    const fullPath = path.join(baseDir, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n');
    console.log(`Created ${file}`);
}

write('src/types/index.ts', `
export interface User { id: string; email: string; name: string }
export interface OpportunityScore { overall_score: number; recommendation: string; recommendation_reason?: string }
export interface Opportunity { 
  id: string; title: string; organization_name: string; category: string; opportunity_type: string;
  is_demo?: boolean; is_verified?: boolean; deadline?: string; value_display?: string; value_max?: number; value_min?: number; currency?: string;
  geography_city?: string; geography_state?: string; geography_country?: string;
}
`);

write('src/lib/utils.ts', `
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return \`\${currency} \${amount}\`
}

export function formatDeadline(deadline: string): { label: string; urgency: 'critical' | 'warning' | 'normal' | 'expired' } {
  return { label: deadline, urgency: 'normal' }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 70) return '#2563EB'
  return '#F59E0B'
}
`);

write('src/components/ui/button.tsx', `
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', rightIcon, children, ...props }, ref) => {
    return (
      <button ref={ref} className={cn('px-4 py-2 rounded-lg font-medium', className)} {...props}>
        {children}
        {rightIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'
`);

write('src/components/ui/score-ring.tsx', `
export function ScoreRing({ score }: { score: number }) {
  return <div className="text-xl font-bold">{score}</div>
}
`);

write('src/components/opportunity/opportunity-card.tsx', `
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Opportunity, OpportunityScore } from '@/types'

export function OpportunityCard({ opportunity, score }: { opportunity: Opportunity, score?: OpportunityScore }) {
  return (
    <div className="card-base p-5 hover:shadow-lg transition-all duration-200">
      <h3 className="font-semibold text-sm leading-snug mb-1.5">{opportunity.title}</h3>
      <p className="text-xs">{opportunity.organization_name}</p>
      {score && <div className="mt-2 text-blue-500 font-bold">{score.overall_score}% Match</div>}
      <Link href={\`/radar/\${opportunity.id}\`} className="mt-4 block">
        <Button variant="outline" className="w-full">Analyze</Button>
      </Link>
    </div>
  )
}
`);

write('src/app/(app)/layout.tsx', `
import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 border-r p-4 flex flex-col gap-2">
        <div className="font-bold mb-4">OpportunityOS</div>
        <Link href="/overview" className="text-sm">Overview</Link>
        <Link href="/radar" className="text-sm">Radar</Link>
      </div>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
`);

write('src/app/(app)/overview/page.tsx', `
export default function OverviewPage() {
  return <div><h1 className="text-2xl font-bold mb-4">Overview</h1><p>Welcome back!</p></div>
}
`);

write('src/app/(app)/radar/page.tsx', `
export default function RadarPage() {
  return <div><h1 className="text-2xl font-bold mb-4">Radar</h1><p>Discover opportunities.</p></div>
}
`);

write('src/app/(auth)/login/page.tsx', `
export default function LoginPage() {
  return <div className="p-10"><h1 className="text-2xl font-bold mb-4">Login</h1></div>
}
`);

write('src/app/(auth)/signup/page.tsx', `
export default function SignupPage() {
  return <div className="p-10"><h1 className="text-2xl font-bold mb-4">Sign Up</h1></div>
}
`);

write('src/app/page.tsx', `
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <main className="w-full flex-1 max-w-7xl mx-auto px-4 py-16 flex flex-col gap-24">
        <section className="text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-bold max-w-4xl tracking-tight leading-tight">Your AI Radar for Business Growth.</h1>
          <div className="mt-10 flex gap-4">
            <Link href="/signup"><Button>Start Discovering</Button></Link>
          </div>
        </section>
      </main>
    </div>
  )
}
`);
