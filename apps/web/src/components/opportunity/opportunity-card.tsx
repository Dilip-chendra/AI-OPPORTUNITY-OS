'use client'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/ui/score-ring'
import { formatCurrency, formatDeadline, cn } from '@/lib/utils'
import { MapPin, Bookmark, ExternalLink, Shield, AlertTriangle } from 'lucide-react'

import { useState } from 'react'
import { opportunitiesApi } from '@/lib/api/opportunities'
import { useAuth } from '@/lib/hooks/use-auth'
import { RolePermissions } from '@/lib/permissions'

export function OpportunityCard({ opportunity, score, isSaved: initialSaved = false }: any) {
  const router = useRouter()
  const { user } = useAuth()
  const canSave = RolePermissions.canSaveOpportunity(user?.role)
  const [saved, setSaved] = useState(initialSaved)
  const [saving, setSaving] = useState(false)
  const deadline = opportunity.deadline ? formatDeadline(opportunity.deadline) : null
  const value = opportunity.value_display || (opportunity.value_max ? formatCurrency(Number(opportunity.value_max), opportunity.currency || 'INR') : null)

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (saving || !canSave) return
    setSaving(true)

    try {
      if (saved) {
        await opportunitiesApi.unsave(opportunity.id)
        setSaved(false)
      } else {
        await opportunitiesApi.save(opportunity.id)
        setSaved(true)
      }
    } catch {
      // Toggle optimistic rollback if failed
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-blue-500/50 transition-colors overflow-hidden group">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={opportunity.category || 'default'} size="sm">{opportunity.category}</Badge>
            {opportunity.is_verified && <Badge variant="verified" size="sm"><Shield className="h-3 w-3 mr-1" />Verified</Badge>}
            {score?.recommendation === 'pursue' && <Badge variant="success" size="sm">Highly Recommended</Badge>}
          </div>
          {score && <ScoreRing score={Math.round(score.overall_score)} size="sm" />}
        </div>
        <h3 onClick={() => router.push('/radar/' + opportunity.id)} className="font-bold text-lg mb-2 leading-tight cursor-pointer hover:text-blue-500 transition-colors line-clamp-2 text-[var(--text-1)]">
          {opportunity.title}
        </h3>
        <div className="flex flex-col gap-1 text-sm text-[var(--text-2)] mb-4">
          <div className="font-medium truncate">{opportunity.organization_name}</div>
          {(opportunity.geography_city || opportunity.geography_country) && (
            <div className="flex items-center gap-1 text-xs"><MapPin className="h-3 w-3" /> {[opportunity.geography_city, opportunity.geography_country].filter(Boolean).join(', ')}</div>
          )}
        </div>
      </div>
      <div className="px-5 py-4 bg-[var(--bg)] border-t border-[var(--border)] mt-auto flex flex-col gap-3">
        <div className="flex justify-between items-end">
          {value ? <div><p className="text-[10px] uppercase text-[var(--text-3)] font-semibold mb-0.5">Value</p><p className="font-mono font-bold text-sm text-[var(--text-1)]">{value}</p></div> : <div/>}
          {deadline ? <div className="text-right"><p className="text-[10px] uppercase text-[var(--text-3)] font-semibold mb-0.5">Deadline</p><p className={cn('text-sm font-semibold', deadline.urgency === 'critical' ? 'text-red-500' : deadline.urgency === 'warning' ? 'text-amber-500' : 'text-[var(--text-1)]')}>{deadline.label}</p></div> : <div/>}
        </div>
        <div className="flex gap-2 mt-1">
          <Button variant="default" className="flex-1" onClick={() => router.push('/radar/' + opportunity.id)}>Analyze</Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleSave}
            disabled={saving || !canSave}
            title={!canSave ? "Viewers cannot save opportunities" : saved ? "Remove from pipeline" : "Save to pipeline"}
            aria-label={saved ? "Remove from pipeline" : "Save to pipeline"}
          >
            <Bookmark className={cn("h-4 w-4 transition-colors", saved ? "fill-blue-500 text-blue-500" : "text-[var(--text-2)]")} />
          </Button>

        </div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden h-[280px]">
      <div className="p-5 flex-1 space-y-4">
        <div className="flex justify-between"><div className="skeleton h-5 w-20 rounded-full" /><div className="skeleton h-8 w-8 rounded-full" /></div>
        <div className="space-y-2"><div className="skeleton h-5 w-full rounded" /><div className="skeleton h-5 w-3/4 rounded" /></div>
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
      <div className="px-5 py-4 bg-[var(--bg)] border-t border-[var(--border)] mt-auto space-y-3">
        <div className="flex justify-between"><div className="skeleton h-4 w-16 rounded" /><div className="skeleton h-4 w-16 rounded" /></div>
        <div className="flex gap-2"><div className="skeleton h-9 flex-1 rounded-md" /><div className="skeleton h-9 w-9 rounded-md" /></div>
      </div>
    </div>
  )
}
