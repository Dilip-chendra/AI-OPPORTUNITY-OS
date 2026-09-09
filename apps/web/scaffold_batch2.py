import os

base_dir = r"c:\Users\admin\Downloads\Git Uploads\AI-OPPORTUNITY-OS\apps\web"

files = {
    r"src\components\providers\theme-provider.tsx": """'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
""",
    r"src\components\providers\query-provider.tsx": """'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 1 },
      mutations: { retry: 0 },
    },
  }))
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
""",
    r"src\lib\utils.ts": """import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`
    if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`
    if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`
    return `₹${amount}`
  }
  if (currency === 'USD') {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
    return `$${amount}`
  }
  if (currency === 'EUR') {
    if (amount >= 1_000_000) return `€${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000) return `€${(amount / 1_000).toFixed(0)}K`
    return `€${amount}`
  }
  return `${amount} ${currency}`
}

export function formatDeadline(deadline: string): { label: string; urgency: 'critical' | 'warning' | 'normal' } {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return { label: 'Expired', urgency: 'critical' }
  if (days === 0) return { label: 'Today', urgency: 'critical' }
  if (days === 1) return { label: '1 day left', urgency: 'critical' }
  if (days <= 7) return { label: `${days} days left`, urgency: 'critical' }
  if (days <= 14) return { label: `${days} days left`, urgency: 'warning' }
  if (days <= 30) return { label: `${days} days left`, urgency: 'normal' }
  return { label: new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), urgency: 'normal' }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-success'
  if (score >= 70) return 'text-primary-500'
  if (score >= 50) return 'text-warning'
  return 'text-danger'
}

export function getScoreRingColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 70) return '#2563EB'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}
""",
    r"src\lib\api\client.ts": """import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
        const { access_token } = refresh.data
        localStorage.setItem('access_token', access_token)
        original.headers.Authorization = `Bearer ${access_token}`
        return apiClient(original)
      } catch {
        localStorage.removeItem('access_token')
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
""",
    r"src\lib\api\auth.ts": """import { apiClient } from './client'
import type { TokenResponse, User } from '@/types'

export interface SignupData {
  email: string
  password: string
  full_name: string
  organization_name: string
}

export interface LoginData {
  email: string
  password: string
}

export const authApi = {
  signup: async (data: SignupData): Promise<{ user: User; tokens: TokenResponse }> => {
    const res = await apiClient.post('/auth/signup', data)
    return res.data
  },
  login: async (data: LoginData): Promise<{ user: User; tokens: TokenResponse }> => {
    const res = await apiClient.post('/auth/login', data)
    return res.data
  },
  refresh: async (): Promise<TokenResponse> => {
    const res = await apiClient.post('/auth/refresh')
    return res.data
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
  me: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me')
    return res.data
  },
}
""",
    r"src\middleware.ts": """import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/signup', '/pricing']
const authRoutes = ['/login', '/signup']
const onboardingRoute = '/onboard'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '')
  
  const isPublic = publicRoutes.some(r => pathname === r)
  const isAuth = authRoutes.some(r => pathname.startsWith(r))
  const isApp = pathname.startsWith('/overview') || pathname.startsWith('/radar') || 
    pathname.startsWith('/explore') || pathname.startsWith('/for-you') ||
    pathname.startsWith('/funding') || pathname.startsWith('/government') ||
    pathname.startsWith('/corporate') || pathname.startsWith('/global') ||
    pathname.startsWith('/partnerships') || pathname.startsWith('/innovation') ||
    pathname.startsWith('/research') || pathname.startsWith('/saved') ||
    pathname.startsWith('/applications') || pathname.startsWith('/workspace') ||
    pathname.startsWith('/ai-analyst') || pathname.startsWith('/business-dna') ||
    pathname.startsWith('/alerts') || pathname.startsWith('/analytics') ||
    pathname.startsWith('/settings')
  
  if (isApp && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (isAuth && token) {
    return NextResponse.redirect(new URL('/overview', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
""",
    r"src\types\index.ts": """export interface User {
  id: string;
  email: string;
  full_name: string;
  organization_name: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: string;
  value: number;
  currency: string;
  deadline: string;
  matchScore: number;
  recommendation: 'PURSUE' | 'REVIEW' | 'WATCH' | 'SKIP' | 'PARTNER';
  verified: boolean;
}
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Successfully generated {len(files)} files for batch 2")
