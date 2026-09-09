import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDeadline, getScoreColor, truncate } from '@/lib/utils'

describe('Utility and Formatters', () => {
  it('formats INR currency accurately into Lakhs and Crores', () => {
    expect(formatCurrency(2500000, 'INR')).toBe('₹25.0L')
    expect(formatCurrency(32000000, 'INR')).toBe('₹3.2Cr')
    expect(formatCurrency(50000, 'INR')).toBe('₹50K')
  })

  it('formats USD and EUR amounts properly', () => {
    expect(formatCurrency(1500000, 'USD')).toBe('$1.5M')
    expect(formatCurrency(250000, 'USD')).toBe('$250K')
    expect(formatCurrency(500000, 'EUR')).toBe('€500K')
  })

  it('returns color hex accurately mapped to 8-dimension match scores', () => {
    expect(getScoreColor(95)).toBe('#10B981') // Green
    expect(getScoreColor(78)).toBe('#2563EB') // Blue
    expect(getScoreColor(62)).toBe('#F59E0B') // Amber
    expect(getScoreColor(35)).toBe('#EF4444') // Red
  })

  it('truncates strings exceeding max length with ellipsis', () => {
    expect(truncate('Smart City AI Surveillance Integration', 15)).toBe('Smart City AI S...')
    expect(truncate('Short', 10)).toBe('Short')
  })

  it('computes urgency labels accurately for deadlines', () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    expect(formatDeadline(past).urgency).toBe('expired')

    const soon = new Date(Date.now() + 3 * 86400000).toISOString()
    expect(formatDeadline(soon).urgency).toBe('critical')
  })
})
