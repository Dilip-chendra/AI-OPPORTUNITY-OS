const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\admin\\Downloads\\Git Uploads\\AI-OPPORTUNITY-OS\\apps\\web';

function write(file, content) {
    const fullPath = path.join(baseDir, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n');
    console.log(`Created ${file}`);
}

write('src/app/globals.css', `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg: #FAFBFF;
    --surface: #FFFFFF;
    --border: #E2E8F0;
    --text-1: #0F1629;
    --text-2: #64748B;
    --text-3: #94A3B8;
    --accent: #2563EB;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --ai: #8B5CF6;
  }
  
  .dark {
    --bg: #0A0F1E;
    --surface: #0F1629;
    --border: #1E2D4A;
    --text-1: #F0F4FF;
    --text-2: #8B9CC8;
    --text-3: #4A5D80;
    --accent: #3B82F6;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --ai: #A78BFA;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border-color: var(--border);
  }

  body {
    background-color: var(--bg);
    color: var(--text-1);
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer components {
  .skeleton {
    background: linear-gradient(90deg, var(--border) 25%, var(--surface) 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  .card-base {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`);

write('src/app/layout.tsx', `
import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'

export const metadata: Metadata = {
  title: 'AI Opportunity OS — Discover. Decide. Capture.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
`);

write('src/components/providers/theme-provider.tsx', `
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
`);

write('src/components/providers/query-provider.tsx', `
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
`);
