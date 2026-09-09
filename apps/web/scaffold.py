import os
import json

base_dir = r"c:\Users\admin\Downloads\Git Uploads\AI-OPPORTUNITY-OS\apps\web"

files = {
    "package.json": """{
  "name": "opportunity-os-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tanstack/react-query": "^5.36.2",
    "axios": "^1.7.2",
    "react-hook-form": "^7.51.5",
    "@hookform/resolvers": "^3.4.2",
    "zod": "^3.23.8",
    "framer-motion": "^11.2.6",
    "lucide-react": "^0.378.0",
    "recharts": "^2.12.7",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-badge": "^1.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-collapsible": "^1.0.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "date-fns": "^3.6.0",
    "next-themes": "^0.3.0",
    "cmdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.3",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.3",
    "vitest": "^1.6.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^15.0.7",
    "@testing-library/jest-dom": "^6.4.5",
    "@playwright/test": "^1.44.1"
  }
}""",
    "tsconfig.json": """{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}""",
    "next.config.js": """/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    domains: ['localhost'],
  },
}
module.exports = nextConfig
""",
    "tailwind.config.ts": """import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', 50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A' },
        success: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#065F46' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#92400E' },
        danger: { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#7F1D1D' },
        ai: { DEFAULT: '#8B5CF6', light: '#EDE9FE', dark: '#4C1D95' },
        dark: { bg: '#0A0F1E', surface: '#0F1629', card: '#131D35', border: '#1E2D4A', 'border-subtle': '#162038', 'text-primary': '#F0F4FF', 'text-secondary': '#8B9CC8', 'text-muted': '#4A5D80' },
        light: { bg: '#FAFBFF', surface: '#FFFFFF', card: '#F8FAFF', border: '#E2E8F0', 'text-primary': '#0F1629', 'text-secondary': '#64748B', 'text-muted': '#94A3B8' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'Menlo', 'monospace'] },
    }
  },
  plugins: [],
}
export default config
""",
    "postcss.config.js": """module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}""",
    "Dockerfile": """FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
""",
    "src/app/globals.css": """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
@layer base {
  :root { --background: 250 251 255; --foreground: 15 22 41; --border: 226 232 240; }
  .dark { --background: 10 15 30; --foreground: 240 244 255; --border: 30 45 74; }
  body { @apply bg-light-bg text-light-text-primary dark:bg-dark-bg dark:text-dark-text-primary; font-feature-settings: 'cv11', 'ss01'; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
}""",
    "src/app/layout.tsx": """import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
export const metadata: Metadata = { title: 'AI Opportunity OS', description: 'The intelligence layer for business opportunities.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
""",
    "src/app/(app)/layout.tsx": """export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen overflow-hidden"><main className="flex-1 overflow-y-auto bg-light-bg dark:bg-dark-bg">{children}</main></div>
}
""",
    "src/app/(app)/overview/page.tsx": """export default function OverviewPage() {
  return <div className="p-8"><h1 className="text-2xl font-bold">Good morning. Here is your opportunity intelligence.</h1></div>
}
""",
    "src/app/(marketing)/page.tsx": """export default function MarketingPage() {
  return <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">Your AI Radar for Business Growth.</h1></div>
}
""",
    "src/app/(auth)/login/page.tsx": """export default function LoginPage() {
  return <div className="min-h-screen flex items-center justify-center">Login Page</div>
}
""",
    "src/types/index.ts": """export interface User { id: string; name: string; email: string; }"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Successfully generated {len(files)} base files in {base_dir}")
