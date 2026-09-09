import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/ui/metric-card'
import { ScoreRing } from '@/components/ui/score-ring'
import { EmptyState } from '@/components/ui/empty-state'
import { Activity, Inbox } from 'lucide-react'

describe('Design System UI Components', () => {
  it('renders Button correctly with variant and text', () => {
    render(<Button variant="primary">Pursue Opportunity</Button>)
    expect(screen.getByRole('button', { name: /Pursue Opportunity/i })).toBeDefined()
  })

  it('renders Badge with default and status variants', () => {
    render(<Badge variant="success">Verified</Badge>)
    expect(screen.getByText('Verified')).toBeDefined()
  })

  it('renders MetricCard with label, value, and change indicator', () => {
    render(
      <MetricCard
        label="Pipeline Value"
        value="₹8.4 Cr"
        change={14.2}
        icon={<Activity className="h-5 w-5" />}
      />
    )
    expect(screen.getByText('Pipeline Value')).toBeDefined()
    expect(screen.getByText('₹8.4 Cr')).toBeDefined()
    expect(screen.getByText('14.2%')).toBeDefined()
  })

  it('renders ScoreRing with numeric match score and accessibility label', () => {
    render(<ScoreRing score={92} size="md" animate={false} />)
    expect(screen.getByLabelText('Score: 92')).toBeDefined()
    expect(screen.getByText('92')).toBeDefined()
  })

  it('renders EmptyState with title, description, and action button', () => {
    render(
      <EmptyState
        icon={<Inbox className="h-8 w-8" />}
        title="No Opportunities Found"
        description="Try adjusting your filter criteria or search query."
        action={{ label: "Reset Filters", onClick: () => {} }}
      />
    )
    expect(screen.getByText('No Opportunities Found')).toBeDefined()
    expect(screen.getByText('Try adjusting your filter criteria or search query.')).toBeDefined()
    expect(screen.getByRole('button', { name: /Reset Filters/i })).toBeDefined()
  })
})
