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
import { 
  Fingerprint, Save, CheckCircle2, Lock, Plus, Trash2, 
  Building2, Briefcase, Award, FolderGit2, Sliders, FileText, X
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { RolePermissions } from '@/lib/permissions'
import type { BusinessProfile } from '@/types'

const STANDARD_CERTS = [
  'MSME / Udyam Certificate',
  'DPIIT Recognized Startup',
  'GeM Primary Seller Account',
  'ISO 9001 Quality Management',
  'ISO 27001 Security Management',
  'CMMI Maturity Level 3+',
  'SOC 2 Type II Compliance',
  'BIS Product Certification'
]

export default function BusinessDNAPage() {
  const qc = useQueryClient()
  const { user, refreshUser } = useAuth()
  const canEdit = RolePermissions.canEditBusinessDNA(user?.role)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessProfileApi.get,
  })

  const [form, setForm] = useState<BusinessProfile>({
    company_name: '',
    trade_name: '',
    legal_name: '',
    registration_number: '',
    industry: 'Information Technology',
    sub_industry: 'Software & Cloud Services',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    address: '',
    company_size: '11-50',
    technical_headcount: '15',
    business_stage: 'Scaling',
    enterprise_classification: 'MSME Small',
    website: '',
    linkedin: '',
    founded_year: '2021',
    description: '',
    products_services: [
      { name: 'Enterprise Cloud Architecture', category: 'Software', description: 'Zero-trust infrastructure and Kubernetes orchestration', target_market: 'Global' }
    ],
    capabilities: ['AI / Machine Learning', 'Cloud Migration', 'Enterprise Software', 'DevOps', 'Data Engineering'],
    tech_stack: ['Python', 'TypeScript', 'Next.js', 'FastAPI', 'PostgreSQL', 'Docker'],
    certifications: ['MSME / Udyam Certificate', 'DPIIT Recognized Startup', 'ISO 9001 Quality Management'],
    previous_projects: [
      { title: 'Smart City Traffic Analytics System', client: 'Municipal Corporation', value: 18000000, year: '2024', description: 'Real-time AI video analytics deployment across 40 intersections.' }
    ],
    preferred_currency: 'INR',
    preferred_contract_min: 500000,
    preferred_contract_max: 50000000,
    funding_required: false,
    export_focused: true,
    consortium_open: true,
    documents: [
      { id: 'doc-1', title: 'Corporate Capability Statement 2026', document_type: 'capability_statement', uploaded_at: '2026-01-15' },
      { id: 'doc-2', title: 'ISO 9001 Quality Certificate', document_type: 'certification', uploaded_at: '2025-11-20' }
    ]
  })

  const [newCap, setNewCap] = useState('')
  const [newTech, setNewTech] = useState('')
  const [newCustomCert, setNewCustomCert] = useState('')
  const [saved, setSaved] = useState(false)

  // New product item modal state
  const [newProd, setNewProd] = useState({ name: '', category: 'Software', description: '', target_market: 'Domestic' })
  // New past project modal state
  const [newProj, setNewProj] = useState({ title: '', client: '', value: '', year: '2024', description: '' })
  // New document modal state
  const [newDoc, setNewDoc] = useState({ title: '', document_type: 'capability_statement' })

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        ...profile,
        capabilities: Array.isArray(profile.capabilities) 
          ? profile.capabilities 
          : typeof profile.capabilities === 'string'
            ? profile.capabilities.split(',').map((s) => s.trim()).filter(Boolean)
            : prev.capabilities,
        tech_stack: Array.isArray(profile.tech_stack)
          ? profile.tech_stack
          : typeof profile.tech_stack === 'string'
            ? profile.tech_stack.split(',').map((s) => s.trim()).filter(Boolean)
            : prev.tech_stack,
        certifications: Array.isArray(profile.certifications)
          ? profile.certifications
          : prev.certifications,
        products_services: Array.isArray(profile.products_services) && profile.products_services.length > 0
          ? profile.products_services
          : prev.products_services,
        previous_projects: Array.isArray(profile.previous_projects) && profile.previous_projects.length > 0
          ? profile.previous_projects
          : prev.previous_projects,
        documents: Array.isArray(profile.documents) && profile.documents.length > 0
          ? profile.documents
          : prev.documents,
      }))
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: (data: Partial<BusinessProfile>) => businessProfileApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-profile'] })
      qc.invalidateQueries({ queryKey: ['opportunities'] })
      qc.invalidateQueries({ queryKey: ['recommendations'] })
      qc.invalidateQueries({ queryKey: ['analytics-overview'] })
      refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  })

  const handleSave = () => {
    if (!canEdit) return
    mutation.mutate(form)
  }

  // Helpers for tags
  const addCapability = () => {
    if (!newCap.trim()) return
    const current = Array.isArray(form.capabilities) ? form.capabilities : []
    if (!current.includes(newCap.trim())) {
      setForm({ ...form, capabilities: [...current, newCap.trim()] })
    }
    setNewCap('')
  }

  const removeCapability = (c: string) => {
    if (!canEdit) return
    const current = Array.isArray(form.capabilities) ? form.capabilities : []
    setForm({ ...form, capabilities: current.filter((item) => item !== c) })
  }

  const addTech = () => {
    if (!newTech.trim()) return
    const current = Array.isArray(form.tech_stack) ? form.tech_stack : []
    if (!current.includes(newTech.trim())) {
      setForm({ ...form, tech_stack: [...current, newTech.trim()] })
    }
    setNewTech('')
  }

  const removeTech = (t: string) => {
    if (!canEdit) return
    const current = Array.isArray(form.tech_stack) ? form.tech_stack : []
    setForm({ ...form, tech_stack: current.filter((item) => item !== t) })
  }

  const toggleCert = (cert: string) => {
    if (!canEdit) return
    const current = Array.isArray(form.certifications) ? form.certifications : []
    const exists = current.includes(cert)
    setForm({
      ...form,
      certifications: exists ? current.filter((c) => c !== cert) : [...current, cert]
    })
  }

  const addCustomCert = () => {
    if (!newCustomCert.trim()) return
    const current = Array.isArray(form.certifications) ? form.certifications : []
    if (!current.includes(newCustomCert.trim())) {
      setForm({ ...form, certifications: [...current, newCustomCert.trim()] })
    }
    setNewCustomCert('')
  }

  // Helpers for Products & Services
  const addProduct = () => {
    if (!newProd.name.trim()) return
    const prods = form.products_services ? [...form.products_services] : []
    prods.push({ ...newProd })
    setForm({ ...form, products_services: prods })
    setNewProd({ name: '', category: 'Software', description: '', target_market: 'Domestic' })
  }

  const removeProduct = (idx: number) => {
    if (!canEdit) return
    const prods = form.products_services ? [...form.products_services] : []
    prods.splice(idx, 1)
    setForm({ ...form, products_services: prods })
  }

  // Helpers for Past Projects
  const addProject = () => {
    if (!newProj.title.trim()) return
    const projs = form.previous_projects ? [...form.previous_projects] : []
    projs.push({
      title: newProj.title,
      client: newProj.client,
      value: parseFloat(newProj.value) || 0,
      year: newProj.year,
      description: newProj.description
    })
    setForm({ ...form, previous_projects: projs })
    setNewProj({ title: '', client: '', value: '', year: '2024', description: '' })
  }

  const removeProject = (idx: number) => {
    if (!canEdit) return
    const projs = form.previous_projects ? [...form.previous_projects] : []
    projs.splice(idx, 1)
    setForm({ ...form, previous_projects: projs })
  }

  // Helpers for Documents
  const addDocument = () => {
    if (!newDoc.title.trim()) return
    const docs = form.documents ? [...form.documents] : []
    docs.push({
      id: `doc-${Date.now()}`,
      title: newDoc.title,
      document_type: newDoc.document_type,
      uploaded_at: new Date().toISOString().split('T')[0]
    })
    setForm({ ...form, documents: docs })
    setNewDoc({ title: '', document_type: 'capability_statement' })
  }

  const removeDoc = (idx: number) => {
    if (!canEdit) return
    const docs = form.documents ? [...form.documents] : []
    docs.splice(idx, 1)
    setForm({ ...form, documents: docs })
  }

  if (isLoading) return <div className="p-6 max-w-5xl mx-auto skeleton h-96 rounded-2xl" />

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {!canEdit && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 text-sm flex items-center gap-3">
          <Lock className="h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Read-Only Mode Active</p>
            <p className="text-xs text-amber-500/80 mt-0.5">
              Only Organization Owners and Administrators can modify Business DNA credentials. Your active role is <strong className="uppercase">{user?.role || 'VIEWER'}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Fingerprint className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Business DNA Studio</h1>
            <p className="text-xs sm:text-sm text-[var(--text-2)]">
              Comprehensive 8-dimension corporate profile used by AI Radar for algorithmic match scoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="md"
            leftIcon={saved ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Save className="h-4 w-4" />}
            loading={mutation.isPending}
            disabled={!canEdit || mutation.isPending}
            onClick={handleSave}
          >
            {saved ? 'Saved Successfully' : canEdit ? 'Save Changes' : 'Save (Restricted)'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="identity">
        <TabsList className="mb-6 flex flex-wrap gap-1">
          <TabsTrigger value="identity" className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Identity & Stage
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Products & Offerings
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" /> Capabilities & Stack
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" /> Compliance & Certs
          </TabsTrigger>
          <TabsTrigger value="trackrecord" className="flex items-center gap-1.5">
            <FolderGit2 className="h-3.5 w-3.5" /> Past Projects
          </TabsTrigger>
          <TabsTrigger value="targets" className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" /> Radar Targets
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Collateral & Docs
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: IDENTITY & STAGE */}
        <TabsContent value="identity">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
            <h3 className="font-bold text-sm text-[var(--text-1)]">Company Identity & Registration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Brand Name *"
                value={form.company_name || ''}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              />
              <Input
                label="Legal Entity Name"
                placeholder="e.g. Apex Technologies Private Limited"
                value={form.legal_name || ''}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
              />
              <Input
                label="Trade / Brand Name"
                placeholder="e.g. Apex AI"
                value={form.trade_name || ''}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, trade_name: e.target.value })}
              />
              <Input
                label="Registration / CIN / GSTIN Number"
                placeholder="e.g. U72200TG2021PTC123456"
                value={form.registration_number || ''}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Select
                label="Primary Industry *"
                value={form.industry || 'Information Technology'}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                options={[
                  { value: 'Information Technology', label: 'IT & Software Systems' },
                  { value: 'Infrastructure & Construction', label: 'Infrastructure & Civil Works' },
                  { value: 'Healthcare & Pharma', label: 'Healthcare & Life Sciences' },
                  { value: 'Manufacturing & Industrial', label: 'Manufacturing & Engineering' },
                  { value: 'Energy & Cleantech', label: 'Renewable Energy & Cleantech' },
                  { value: 'Consulting & Services', label: 'Professional Consulting & B2B' },
                ]}
              />
              <Select
                label="Enterprise Classification"
                value={form.enterprise_classification || 'MSME Small'}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, enterprise_classification: e.target.value })}
                options={[
                  { value: 'MSME Micro', label: 'MSME Micro (< ₹1 Cr investment)' },
                  { value: 'MSME Small', label: 'MSME Small (< ₹10 Cr investment)' },
                  { value: 'MSME Medium', label: 'MSME Medium (< ₹50 Cr investment)' },
                  { value: 'DPIIT Startup', label: 'DPIIT Recognized Startup' },
                  { value: 'Large Enterprise', label: 'Large Commercial Enterprise' },
                ]}
              />
              <Select
                label="Company Size"
                value={form.company_size || '11-50'}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                options={[
                  { value: '1-10', label: '1 - 10 Employees' },
                  { value: '11-50', label: '11 - 50 Employees' },
                  { value: '51-200', label: '51 - 200 Employees' },
                  { value: '201-500', label: '201 - 500 Employees' },
                  { value: '500+', label: '500+ Employees' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Input
                label="Country *"
                value={form.country || ''}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
              <Input
                label="State / Province *"
                value={form.state || ''}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <Input
                label="City / Headquarters *"
                value={form.city || ''}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Official Website"
                placeholder="https://company.com"
                value={form.website || ''}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
              <Input
                label="LinkedIn Profile"
                placeholder="https://linkedin.com/company/..."
                value={form.linkedin || ''}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              />
            </div>

            <Textarea
              label="Company Overview & Core Value Proposition"
              value={form.description || ''}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Detail your engineering strengths, domain specialization, and delivery guarantees."
            />
          </div>
        </TabsContent>

        {/* TAB 2: PRODUCTS & SERVICES */}
        <TabsContent value="products">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-1)]">Products & Services Catalog</h3>
                <p className="text-xs text-[var(--text-2)]">Structured solutions matched by radar against tender scopes.</p>
              </div>
            </div>

            {canEdit && (
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">Add New Offering</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Product / Solution Name"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  />
                  <Input
                    placeholder="Category (e.g. Cloud, AI, Security)"
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  />
                  <Input
                    placeholder="Target Market (e.g. Enterprise, Govt)"
                    value={newProd.target_market}
                    onChange={(e) => setNewProd({ ...newProd, target_market: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Brief description of capabilities and deliverables"
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                />
                <Button size="sm" variant="outline" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={addProduct}>
                  Add Offering
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {(!form.products_services || form.products_services.length === 0) ? (
                <p className="text-xs text-[var(--text-3)] py-4 text-center">No products or services listed yet.</p>
              ) : (
                form.products_services.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-1)]">{item.name}</span>
                        {item.category && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            {item.category}
                          </span>
                        )}
                        {item.target_market && (
                          <span className="text-[10px] text-[var(--text-3)] font-mono">
                            Target: {item.target_market}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-2)]">{item.description}</p>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => removeProduct(idx)}
                        className="text-[var(--text-3)] hover:text-red-500 p-1 transition-colors"
                        title="Delete offering"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: CAPABILITIES & TECH STACK */}
        <TabsContent value="capabilities">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
            {/* Core Capabilities */}
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-1)]">Core Competencies & Capabilities</h3>
                <p className="text-xs text-[var(--text-2)]">Key technical and domain skills used in capability fit scoring.</p>
              </div>

              {canEdit && (
                <div className="flex gap-2 max-w-md">
                  <Input
                    placeholder="Add capability (e.g. Computer Vision, DevOps)"
                    value={newCap}
                    onChange={(e) => setNewCap(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCapability(); } }}
                  />
                  <Button size="sm" variant="outline" onClick={addCapability}>
                    Add
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {(Array.isArray(form.capabilities) ? form.capabilities : []).map((cap, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-medium text-[var(--text-1)]"
                  >
                    {cap}
                    {canEdit && (
                      <button onClick={() => removeCapability(cap)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-3 pt-6 border-t border-[var(--border)]">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-1)]">Technology Stack & Tools</h3>
                <p className="text-xs text-[var(--text-2)]">Frameworks, cloud environments, and programming languages.</p>
              </div>

              {canEdit && (
                <div className="flex gap-2 max-w-md">
                  <Input
                    placeholder="Add technology (e.g. AWS, PostgreSQL, React)"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                  />
                  <Button size="sm" variant="outline" onClick={addTech}>
                    Add
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {(Array.isArray(form.tech_stack) ? form.tech_stack : []).map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-purple-500/20 bg-purple-500/10 text-xs font-mono text-purple-400"
                  >
                    {tech}
                    {canEdit && (
                      <button onClick={() => removeTech(tech)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: COMPLIANCE & CERTIFICATIONS */}
        <TabsContent value="compliance">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-1)]">Government Registrations & Standard Certifications</h3>
              <p className="text-xs text-[var(--text-2)]">Directly drives eligibility scoring on government tenders and corporate RFPs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STANDARD_CERTS.map((cert, idx) => {
                const isChecked = Array.isArray(form.certifications) && form.certifications.includes(cert)
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-[var(--text-1)]'
                        : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-2)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!canEdit}
                      onChange={() => toggleCert(cert)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">{cert}</span>
                  </label>
                )
              })}
            </div>

            {canEdit && (
              <div className="pt-4 border-t border-[var(--border)] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">Add Custom Certification</span>
                <div className="flex gap-2 max-w-md">
                  <Input
                    placeholder="e.g. HIPAA Compliance, CE Mark"
                    value={newCustomCert}
                    onChange={(e) => setNewCustomCert(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomCert(); } }}
                  />
                  <Button size="sm" variant="outline" onClick={addCustomCert}>
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 5: PAST PROJECTS */}
        <TabsContent value="trackrecord">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-1)]">Past Completed Projects & Track Record</h3>
              <p className="text-xs text-[var(--text-2)]">Empirical delivery history boosting execution fit and proposal generation.</p>
            </div>

            {canEdit && (
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">Add Past Contract Record</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Project Title"
                      value={newProj.title}
                      onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Client / Ministry"
                    value={newProj.client}
                    onChange={(e) => setNewProj({ ...newProj, client: e.target.value })}
                  />
                  <Input
                    placeholder="Contract Value (₹ / $)"
                    type="number"
                    value={newProj.value}
                    onChange={(e) => setNewProj({ ...newProj, value: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Summary of deliverables, team size, and outcome achieved"
                  value={newProj.description}
                  onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                />
                <Button size="sm" variant="outline" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={addProject}>
                  Add Track Record
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {(!form.previous_projects || form.previous_projects.length === 0) ? (
                <p className="text-xs text-[var(--text-3)] py-4 text-center">No past projects registered.</p>
              ) : (
                form.previous_projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-1)]">{proj.title}</span>
                        {proj.client && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            Client: {proj.client}
                          </span>
                        )}
                        {proj.value && (
                          <span className="text-[10px] text-[var(--text-3)] font-mono">
                            Val: {form.preferred_currency === 'USD' ? `$${Number(proj.value).toLocaleString()}` : `₹${Number(proj.value).toLocaleString()}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-2)]">{proj.description}</p>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => removeProject(idx)}
                        className="text-[var(--text-3)] hover:text-red-500 p-1 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 6: TARGETS & RADAR */}
        <TabsContent value="targets">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-1)]">Target Preferences & Radar Calibration</h3>
              <p className="text-xs text-[var(--text-2)]">Sets the boundary parameters for value fit and geographical scoring.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Min Target Contract Value"
                type="number"
                disabled={!canEdit}
                value={form.preferred_contract_min ? String(form.preferred_contract_min) : ''}
                onChange={(e) => setForm({ ...form, preferred_contract_min: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Max Target Contract Value"
                type="number"
                disabled={!canEdit}
                value={form.preferred_contract_max ? String(form.preferred_contract_max) : ''}
                onChange={(e) => setForm({ ...form, preferred_contract_max: parseFloat(e.target.value) || 0 })}
              />
              <Select
                label="Preferred Currency"
                value={form.preferred_currency || 'INR'}
                disabled={!canEdit}
                onChange={(e) => setForm({ ...form, preferred_currency: e.target.value })}
                options={[
                  { value: 'INR', label: 'INR (₹ Indian Rupee)' },
                  { value: 'USD', label: 'USD ($ US Dollar)' },
                  { value: 'EUR', label: 'EUR (€ Euro)' },
                  { value: 'GBP', label: 'GBP (£ British Pound)' },
                ]}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              <Switch
                label="Active Grant & Non-Dilutive Subsidies Seeker"
                checked={form.funding_required ?? false}
                disabled={!canEdit}
                onChange={(c) => setForm({ ...form, funding_required: c })}
              />
              <Switch
                label="Export & Global Procurement Focused"
                checked={form.export_focused ?? false}
                disabled={!canEdit}
                onChange={(c) => setForm({ ...form, export_focused: c })}
              />
              <Switch
                label="Consortium & Joint-Venture Co-Bidding Open"
                checked={form.consortium_open ?? true}
                disabled={!canEdit}
                onChange={(c) => setForm({ ...form, consortium_open: c })}
              />
            </div>
          </div>
        </TabsContent>

        {/* TAB 7: COLLATERAL & DOCUMENTS */}
        <TabsContent value="documents">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-1)]">Collateral & Compliance Documents</h3>
              <p className="text-xs text-[var(--text-2)]">Evidence attachments referenced during AI proposal drafting.</p>
            </div>

            {canEdit && (
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">Attach Document Record</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Document Title (e.g. Audited Accounts 2025)"
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    />
                  </div>
                  <Select
                    value={newDoc.document_type}
                    onChange={(e) => setNewDoc({ ...newDoc, document_type: e.target.value })}
                    options={[
                      { value: 'capability_statement', label: 'Capability Statement' },
                      { value: 'certification', label: 'Certificate / Accreditation' },
                      { value: 'financial', label: 'Audited Financials' },
                      { value: 'case_study', label: 'Case Study / Reference' },
                    ]}
                  />
                </div>
                <Button size="sm" variant="outline" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={addDocument}>
                  Register Document
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {(!form.documents || form.documents.length === 0) ? (
                <p className="text-xs text-[var(--text-3)] py-4 text-center">No documents registered.</p>
              ) : (
                form.documents.map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[var(--text-1)]">{doc.title}</p>
                        <p className="text-[11px] text-[var(--text-3)] font-mono">
                          Type: {doc.document_type} • Added: {doc.uploaded_at || 'Recent'}
                        </p>
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => removeDoc(idx)}
                        className="text-[var(--text-3)] hover:text-red-500 p-1 transition-colors"
                        title="Remove document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
