'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evidenceApi, EvidenceDocument } from '@/lib/api/evidence'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Shield, Plus, Trash2, CheckCircle2 } from 'lucide-react'

function expiryBadge(doc: EvidenceDocument) {
  if (!doc.expiry_date) return null
  const daysLeft = Math.ceil((new Date(doc.expiry_date).getTime() - Date.now()) / 86400000)
  if (daysLeft < 0) return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">Expired</Badge>
  if (daysLeft <= 30) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Expires in {daysLeft}d</Badge>
  return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Valid ({daysLeft}d left)</Badge>
}

export default function EvidenceVaultPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', document_type: 'certificate', expiry_date: '' })

  const { data: docs, isLoading } = useQuery<EvidenceDocument[]>({
    queryKey: ['evidence'],
    queryFn: evidenceApi.list,
  })

  const createMutation = useMutation({
    mutationFn: evidenceApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['evidence'] })
      setShowForm(false)
      setForm({ title: '', document_type: 'certificate', expiry_date: '' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: evidenceApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evidence'] }),
  })

  const docTypes = ['certificate', 'registration', 'financial', 'legal', 'technical', 'reference', 'other']

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Evidence Vault</h1>
            <p className="text-sm text-[var(--text-2)]">Reusable documents with expiry tracking. Attach to compliance matrices instantly.</p>
          </div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(!showForm)}>Add Document</Button>
      </div>

      {/* Add Document Form */}
      {showForm && (
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <h3 className="font-semibold text-[var(--text-1)]">Add Evidence Document</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Document title"
              value={form.title}
              onChange={(e: any) => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <select
              value={form.document_type}
              onChange={(e) => setForm(f => ({ ...f, document_type: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text-1)]"
            >
              {docTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <Input
              type="date"
              placeholder="Expiry date (optional)"
              value={form.expiry_date}
              onChange={(e: any) => setForm(f => ({ ...f, expiry_date: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMutation.mutate(form)} loading={createMutation.isPending} disabled={!form.title}>Save Document</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Document List */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : !docs?.length ? (
        <EmptyState title="No documents yet" description="Add certificates, registrations, financials, and other reusable documents here." />
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-[var(--text-1)]">{doc.title}</p>
                  <p className="text-xs text-[var(--text-3)] capitalize">{doc.document_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {expiryBadge(doc)}
                <button
                  onClick={() => deleteMutation.mutate(doc.id)}
                  className="text-[var(--text-3)] hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
