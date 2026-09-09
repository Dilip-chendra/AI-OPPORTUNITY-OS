'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { businessProfileApi } from '@/lib/api/business-profile'
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Building2, Target, Globe, Shield, Rocket } from 'lucide-react'

export default function OnboardPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [analyzingProgress, setAnalyzingProgress] = useState(0)

  const [formData, setFormData] = useState({
    company_name: '',
    industry: 'Information Technology',
    company_size: '11-50',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    preferred_currency: 'INR',
    preferred_contract_min: '500000',
    preferred_contract_max: '50000000',
    capabilities: 'AI, Cloud Migration, Enterprise Software, DevOps',
    certifications: ['MSME / Udyam', 'DPIIT Startup India', 'ISO 9001'],
    funding_required: false,
    export_focused: false
  })

  useEffect(() => {
    if (step === 6) {
      const interval = setInterval(() => {
        setAnalyzingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 300)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleNext = async () => {
    if (step < 5) {
      setStep((s) => s + 1)
    } else if (step === 5) {
      setStep(6)
      try {
        await businessProfileApi.update({
          company_name: formData.company_name,
          industry: formData.industry,
          company_size: formData.company_size,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          preferred_currency: formData.preferred_currency,
          funding_required: formData.funding_required,
          export_focused: formData.export_focused
        })
      } catch (e) {
        console.error('Failed to save profile on step 5', e)
      }
    } else {
      setLoading(true)
      try {
        await businessProfileApi.completeOnboarding()
      } catch (err) {
        console.error('Failed to complete onboarding', err)
      } finally {
        router.push('/overview')
      }
    }
  }

  const stepTitles = [
    { title: 'Company Profile', icon: <Building2 className="h-4 w-4" /> },
    { title: 'Opportunity Scope', icon: <Target className="h-4 w-4" /> },
    { title: 'Geographic Reach', icon: <Globe className="h-4 w-4" /> },
    { title: 'Capabilities & Compliance', icon: <Shield className="h-4 w-4" /> },
    { title: 'Growth Goals', icon: <Rocket className="h-4 w-4" /> },
    { title: 'Radar Synthesis', icon: <Sparkles className="h-4 w-4" /> }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="w-full max-w-2xl bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-2xl">
        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between gap-1.5 mb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-blue-600' : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              {stepTitles[step - 1].icon}
            </div>
            <div>
              <span className="text-[11px] font-mono text-[var(--text-3)] uppercase tracking-wider">Step {step} of 6</span>
              <h2 className="text-xl font-bold text-[var(--text-1)]">{stepTitles[step - 1].title}</h2>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[320px] mb-8">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <Input
                label="Company or Enterprise Name *"
                placeholder="e.g. Apex AI Solutions Ltd."
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Primary Industry *"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  options={[
                    { value: 'Information Technology', label: 'IT & Software Services' },
                    { value: 'Infrastructure & Construction', label: 'Infrastructure & Construction' },
                    { value: 'Healthcare & Pharma', label: 'Healthcare & Life Sciences' },
                    { value: 'Manufacturing & Industrial', label: 'Manufacturing & Engineering' },
                    { value: 'Energy & Cleantech', label: 'Energy & Environment' },
                    { value: 'Consulting & Services', label: 'Consulting & B2B Services' },
                  ]}
                />
                <Select
                  label="Company Size *"
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  options={[
                    { value: '1-10', label: '1 - 10 Employees (Micro)' },
                    { value: '11-50', label: '11 - 50 Employees (Small)' },
                    { value: '51-200', label: '51 - 200 Employees (Medium)' },
                    { value: '201-500', label: '201 - 500 Employees' },
                    { value: '500+', label: '500+ Employees (Enterprise)' },
                  ]}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-[var(--text-2)]">Specify contract values and target procurement channels for radar calibration.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Min Target Contract Value (₹ / $)"
                  type="number"
                  value={formData.preferred_contract_min}
                  onChange={(e) => setFormData({ ...formData, preferred_contract_min: e.target.value })}
                />
                <Input
                  label="Max Target Contract Value (₹ / $)"
                  type="number"
                  value={formData.preferred_contract_max}
                  onChange={(e) => setFormData({ ...formData, preferred_contract_max: e.target.value })}
                />
              </div>
              <Select
                label="Preferred Currency"
                value={formData.preferred_currency}
                onChange={(e) => setFormData({ ...formData, preferred_currency: e.target.value })}
                options={[
                  { value: 'INR', label: 'INR (₹ Indian Rupee)' },
                  { value: 'USD', label: 'USD ($ US Dollar)' },
                  { value: 'EUR', label: 'EUR (€ Euro)' },
                ]}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Country *"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
                <Input
                  label="State / Province"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
                <Input
                  label="City / Headquarters"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] mt-4">
                <Switch
                  label="Include International & Cross-Border Opportunities"
                  checked={formData.export_focused}
                  onChange={(c) => setFormData({ ...formData, export_focused: c })}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <Input
                label="Core Capabilities & Technologies (comma-separated)"
                value={formData.capabilities}
                onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                placeholder="e.g. AI, Cyber Security, Solar EPC, React"
              />
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-2)]">
                  Active Certifications & Registrations
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'MSME / Udyam Certificate',
                    'DPIIT Recognized Startup',
                    'GeM Primary Seller Account',
                    'ISO 9001 Quality Management',
                    'ISO 27001 Security Management',
                    'CMMI Maturity Level 3+'
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs cursor-pointer">
                      <input type="checkbox" defaultChecked={idx < 3} className="rounded text-blue-600" />
                      <span className="text-[var(--text-1)] font-medium">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-xs text-[var(--text-2)]">Select strategic growth priorities for the AI Opportunity Analyst.</p>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <Switch
                    label="Active Grant & Non-Dilutive Subsidies Seeker"
                    checked={formData.funding_required}
                    onChange={(c) => setFormData({ ...formData, funding_required: c })}
                  />
                  <p className="text-[11px] text-[var(--text-3)] mt-1 ml-11">
                    Radar will prioritize Ministry grants, R&D awards, and seed funds.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <Switch
                    label="Consortium & Co-Bidding Alliances Open"
                    checked={true}
                    onChange={() => {}}
                  />
                  <p className="text-[11px] text-[var(--text-3)] mt-1 ml-11">
                    Allows discovery of co-bidding invites where you can act as sub-contractor or prime.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-col items-center justify-center h-full py-8 space-y-6 text-center animate-fade-in">
              <div className="relative">
                <div className="h-20 w-20 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-blue-600">
                  {analyzingProgress}%
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[var(--text-1)] mb-1">
                  {analyzingProgress < 100 ? 'Synthesizing Your Opportunity Radar...' : 'Your Radar is Calibrated & Ready!'}
                </h3>
                <p className="text-xs text-[var(--text-2)] max-w-sm">
                  {analyzingProgress < 40 && 'Analyzing verified Business DNA credentials...'}
                  {analyzingProgress >= 40 && analyzingProgress < 80 && 'Ingesting active government, grant & corporate rosters...'}
                  {analyzingProgress >= 80 && analyzingProgress < 100 && 'Computing 8-dimension match indices...'}
                  {analyzingProgress === 100 && 'Successfully matched 47 relevant opportunities!'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
          <Button
            variant="ghost"
            disabled={step === 1 || step === 6 || loading}
            onClick={() => setStep((s) => s - 1)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={loading || (step === 1 && !formData.company_name)}
            rightIcon={step < 6 ? <ArrowRight className="h-4 w-4" /> : undefined}
            loading={loading}
          >
            {step === 6 ? 'Launch Opportunity Radar' : step === 5 ? 'Synthesize Radar' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
