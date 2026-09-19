'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Zap, Mail, Lock, User, Building2, Eye, EyeOff, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, 
  Dna, Target, TrendingUp, Sparkles
} from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'

export default function SignupPage() {
  const [formData, setFormData] = useState({ 
    full_name: '', 
    organization_name: '', 
    email: '', 
    password: '', 
    confirm_password: '' 
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useAuth()

  const passwordsMatch = formData.password && formData.confirm_password && formData.password === formData.confirm_password
  const passwordValid = formData.password.length >= 8

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.full_name.trim()) return setError('Full name is required')
    if (!formData.organization_name.trim()) return setError('Organization name is required')
    if (formData.password !== formData.confirm_password) return setError('Passwords do not match')
    if (formData.password.length < 8) return setError('Password must be at least 8 characters')
    
    setLoading(true)
    setError('')
    try {
      const res = await authApi.signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        organization_name: formData.organization_name
      })
      localStorage.setItem('access_token', res.access_token)
      document.cookie = `access_token=${res.access_token}; path=/; max-age=86400; SameSite=Lax`
      if (res.user) {
        setUser(res.user)
      }
      router.push('/onboard')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (err.response?.status === 400 && detail?.toLowerCase().includes('email')) {
        setError('__email_exists__')
      } else {
        setError(detail || err.message || 'Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#060813] text-slate-100 flex relative overflow-hidden">
      {/* Ambient Radial Lights */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[650px] h-[650px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[200px] pointer-events-none" />

      {/* Subtle Telemetry Grid Across Canvas */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* LEFT SHOWCASE PANEL (Desktop Only) */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-slate-800/60 bg-gradient-to-br from-[#080d1e]/80 via-[#060914]/60 to-transparent">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-white fill-current" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                Opportunity<span className="text-cyan-400">OS</span>
              </span>
              <span className="ml-2 px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                v3.0
              </span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono">
            <Sparkles className="h-3 w-3" />
            <span>ORGANIZATION ONBOARDING</span>
          </div>
        </div>

        {/* Narrative & Capabilities Showcase */}
        <div className="my-auto py-8 space-y-7 max-w-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              <span>Algorithmic Enterprise Intelligence</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.14]">
              Build your competitive moat on <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">live intelligence.</span>
            </h1>
            <p className="text-sm xl:text-base text-slate-400 leading-relaxed">
              Stop scouring fragmented portals. OpportunityOS continuously ingests your capabilities, pre-screens requirements, and qualifies high-probability contracts.
            </p>
          </div>

          {/* 3 Value Pillars Showcase */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#0d1428]/80 backdrop-blur-md flex items-start gap-4 hover:border-cyan-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Dna className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">1. Central Business DNA</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ingest capabilities, past performances, certifications, and target contracts into a single living profile that powers all scoring.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#0d1428]/80 backdrop-blur-md flex items-start gap-4 hover:border-cyan-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Target className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">2. Deterministic Hard Gates</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instantly eliminate mismatched opportunities before wasting hours on manual document review or compliance inquiries.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#0d1428]/80 backdrop-blur-md flex items-start gap-4 hover:border-cyan-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">3. Pursuit ROI Modeling</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compute expected value, win margins, and bid cost before committing engineering and proposal drafting resources.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Footer Trust Badges */}
        <div className="pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-white font-bold block text-sm">50,000+</span>
              <span className="text-[10px] text-slate-500 uppercase">Live Sources</span>
            </div>
            <div>
              <span className="text-white font-bold block text-sm">₹48,000 Cr+</span>
              <span className="text-[10px] text-slate-500 uppercase">Catalog Value</span>
            </div>
            <div>
              <span className="text-white font-bold block text-sm">100% Isolated</span>
              <span className="text-[10px] text-slate-500 uppercase">Tenant Security</span>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <span>© 2026 OpportunityOS</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIGNUP CARD PANEL */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10 md:p-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md p-8 sm:p-9 my-auto rounded-3xl bg-[#0b1020]/90 backdrop-blur-2xl border border-slate-800/90 shadow-[0_25px_80px_rgba(0,0,0,0.85)] relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white fill-current" />
            </div>
            <span className="text-base font-bold text-white">
              Opportunity<span className="text-cyan-400">OS</span>
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              New Workspace Setup
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Create an account
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Equip your organization with real-time opportunity discovery and intelligence.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Full Name Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  placeholder="e.g. Maya Chen"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#111728] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            {/* Organization Name Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Organization / Company Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={formData.organization_name}
                  onChange={e => setFormData({ ...formData, organization_name: e.target.value })}
                  required
                  placeholder="e.g. Apex Defense Solutions"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#111728] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="name@company.com"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#111728] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Min 8 characters</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-10 pr-11 rounded-xl bg-[#111728] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-10 pr-11 rounded-xl bg-[#111728] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirm_password && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                  {passwordsMatch ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error Notifications */}
            {error === '__email_exists__' ? (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs space-y-2.5 animate-in fade-in duration-200">
                <div className="font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
                  Account Already Exists
                </div>
                <p className="text-[11px] text-amber-300 leading-relaxed">
                  An account is already registered with <strong>{formData.email}</strong>. You don't need to create a new one.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    href={`/login?email=${encodeURIComponent(formData.email)}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors shadow-sm"
                  >
                    Sign In Directly
                  </Link>
                  <Link
                    href={`/forgot-password?email=${encodeURIComponent(formData.email)}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 font-medium text-xs hover:bg-slate-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
            ) : error ? (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            ) : null}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 transform active:scale-[0.99] border-0"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Workspace...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Create Enterprise Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Form Footer */}
          <div className="space-y-3 pt-4 mt-4 border-t border-slate-800 text-center">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Already have an account? <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline">Sign in</Link></span>
              <Link href="/forgot-password" className="text-[11px] text-slate-500 hover:text-cyan-400 hover:underline">Forgot password?</Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/80" />
              <span>256-bit TLS Encrypted • Tenant-Isolated Workspace</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
