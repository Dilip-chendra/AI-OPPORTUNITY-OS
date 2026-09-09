import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/lib/hooks/use-auth'

export const metadata: Metadata = {
  title: 'OpportunityOS — The Intelligence Layer for Business Opportunities',
  description: 'OpportunityOS continuously discovers, ranks, and helps businesses act on valuable opportunities across government tenders, grants, corporate RFPs, and global contracts.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-cyan-500/20 selection:text-cyan-200 min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
