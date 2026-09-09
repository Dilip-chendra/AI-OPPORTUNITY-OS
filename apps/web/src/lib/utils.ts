import { clsx, type ClassValue } from 'clsx'
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

export function formatDeadline(deadline: string): { label: string; urgency: 'critical' | 'warning' | 'normal' | 'expired' } {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return { label: 'Expired', urgency: 'expired' }
  if (days === 0) return { label: 'Due Today', urgency: 'critical' }
  if (days === 1) return { label: '1 day left', urgency: 'critical' }
  if (days <= 7) return { label: `${days} days left`, urgency: 'critical' }
  if (days <= 14) return { label: `${days} days left`, urgency: 'warning' }
  const d = new Date(deadline)
  return { label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), urgency: 'normal' }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 70) return '#2563EB'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
