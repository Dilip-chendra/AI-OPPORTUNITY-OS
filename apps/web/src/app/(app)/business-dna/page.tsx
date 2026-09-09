'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessProfileApi } from '@/lib/api/business-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Fingerprint, Save, CheckCircle2 } from 'lucide-react'

export default function BusinessDNAPage() {
  const qc = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessProfileApi.get,
  })

  const [form, setForm] = useState<any>({
    company_name: '',
    industry: 'Information Technology',
    sub_industry: 'Software & Cloud Services',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    company_size: '11-50',
    website: '',
    description: '',
    preferred_currency: 'INR',
    funding_required: false,
    export_focused: false,
  })

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm((prev: any) => ({ ...prev, ...profile }))
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: (data: any) => businessProfileApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  })

  if (isLoading) return <div className="p-6 max-w-4xl mx-auto skeleton h-96 rounded-2xl" />

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Business DNA Profile</h1>
            <p className="text-xs sm:text-sm text-[var(--text-2)]">Your company credentials used by the AI Radar to calculate match scores.</p>
          </div>
        </div>

        <Button
          size="md"
          leftIcon={saved ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Save className="h-4 w-4" />}
          loading={mutation.isPending}
          onClick={() => mutation.mutate(form)}
        >
          {saved ? 'Saved Successfully' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="basics">
        <TabsList className="mb-6">
          <TabsTrigger value="basics">Company Basics</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities & Tech</TabsTrigger>
          <TabsTrigger value="preferences">Target Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={form.company_name || ''}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              />
              <Select
                label="Primary Industry"
                value={form.industry || 'Information Technology'}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                options={[
                  { value: 'Information Technology', label: 'Information Technology & AI' },
                  { value: 'Infrastructure & Construction', label: 'Infrastructure & Civil Works' },
                  { value: 'Healthcare & Pharma', label: 'Healthcare & Life Sciences' },
                  { value: 'Manufacturing & Industrial', label: 'Manufacturing & Engineering' },
                  { value: 'Energy & Cleantech', label: 'Renewable Energy & Cleantech' },
                  { value: 'Consulting & Services', label: 'Management & Professional Services' },
                ]}
              />
              <Input
                label="Country"
                value={form.country || ''}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
              <Input
                label="State / Province"
                value={form.state || ''}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <Input
                label="City"
                value={form.city || ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <Select
                label="Company Size"
                value={form.company_size || '11-50'}
                onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                options={[
                  { value: '1-10', label: '1 - 10 Employees (Micro)' },
                  { value: '11-50', label: '11 - 50 Employees (Small)' },
                  { value: '51-200', label: '51 - 200 Employees (Medium)' },
                  { value: '201-500', label: '201 - 500 Employees' },
                  { value: '500+', label: '500+ Employees (Enterprise)' },
                ]}
              />
            </div>
            <Input
              label="Website URL"
              value={form.website || ''}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://yourcompany.com"
            />
            <Textarea
              label="Company Overview & Core Offerings"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Provide a brief summary of what your company builds, delivers, and specializes in."
            />
          </div>
        </TabsContent>

        <TabsContent value="capabilities">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--text-1)]">Registrations & Compliance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                'MSME / Udyam Registered',
                'DPIIT Recognized Startup',
                'GeM Portal Empanelled',
                'ISO 9001 Certified',
                'ISO 27001 Certified',
                'CMMI Level 3+'
              ].map((cert, i) => (
                <div key={i} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] flex items-center gap-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-[var(--text-1)] font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Preferred Currency"
                value={form.preferred_currency || 'INR'}
                onChange={(e) => setForm({ ...form, preferred_currency: e.target.value })}
                options={[
                  { value: 'INR', label: 'INR (₹ Indian Rupee)' },
                  { value: 'USD', label: 'USD ($ US Dollar)' },
                  { value: 'EUR', label: 'EUR (€ Euro)' },
                ]}
              />
            </div>
            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              <Switch
                label="Active Grant & Non-Dilutive Funding Seeker"
                checked={form.funding_required}
                onChange={(c) => setForm({ ...form, funding_required: c })}
              />
              <Switch
                label="Export & Global Procurement Focused"
                checked={form.export_focused}
                onChange={(c) => setForm({ ...form, export_focused: c })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
