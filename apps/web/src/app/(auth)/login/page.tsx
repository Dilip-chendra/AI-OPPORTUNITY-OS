'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Zap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, 
  CheckCircle2, AlertCircle, Terminal
} from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { businessProfileApi } from '@/lib/api/business-profile'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const resetSuccess = searchParams.get('reset') === 'success'

  const [email, setEmail] = useState(initialEmail || '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail)
    }
  }, [initialEmail, email])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return setError('Please enter your work email')
    if (!password) return setError('Please enter your password')
    
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login({ email: email.trim(), password })
      localStorage.setItem('access_token', res.access_token)
      const maxAge = rememberMe ? 86400 * 30 : 86400
      document.cookie = `access_token=${res.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`
      if (res.user) {
        setUser(res.user)
      }

      // Check if onboarding is completed for this user
      try {
        const profile = await businessProfileApi.get()
        if (profile && !profile.onboarding_completed) {
          router.push('/onboard')
          return
        }
      } catch {}

      router.push('/overview')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(detail || (err.response?.status === 401 ? 'Invalid email or password.' : err.message || 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[440px] space-y-7">
      {/* Form Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold tracking-wide uppercase mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Enterprise Authentication
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
          Sign in to access your OpportunityOS command center.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3.5 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Password reset successful! Please sign in with your new password.</span>
        </div>
      )}

      {/* Login Credentials Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Work Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="name@company.com"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#111728] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#111728] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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

        {/* Keep signed in checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-[#111728] text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-xs text-slate-400">Remember this device</span>
          </label>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 text-xs rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-semibold leading-snug">{error}</p>
              {error.includes('Invalid email or password') && (
                <p className="text-slate-400 pt-0.5">
                  Need to reset?{' '}
                  <Link
                    href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                    className="text-cyan-400 hover:underline font-medium"
                  >
                    Reset password here
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit CTA */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 transform active:scale-[0.99] border-0"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating Session...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Sign In to OpportunityOS</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </form>

      {/* Form Footer */}
      <div className="space-y-4 pt-2 border-t border-slate-800 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <span>Don't have an organization account?</span>
          <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline">
            Sign up
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/80" />
          <span>256-bit TLS Encrypted • Tenant-Isolated Session</span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#060813] text-slate-100 flex relative overflow-hidden">
      {/* Ambient Radial Lights */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[650px] h-[650px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[200px] pointer-events-none" />

      {/* Subtle Telemetry Grid Across Canvas */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* LEFT SHOWCASE PANEL (Desktop Only) */}
      <div className="hidden lg:flex w-[55%] flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-slate-800/60 bg-gradient-to-br from-[#080d1e]/80 via-[#060914]/60 to-transparent">
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

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE INTELLIGENCE STREAM</span>
          </div>
        </div>

        {/* Hero Narrative & Live Telemetry Card */}
        <div className="my-auto py-10 space-y-8 max-w-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              <Terminal className="h-3.5 w-3.5" />
              <span>Algorithmic Opportunity Operating System</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.12]">
              Find the contracts your business was <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">built to win.</span>
            </h1>
            <p className="text-sm xl:text-base text-slate-400 leading-relaxed">
              Continuous tender discovery, deterministic Hard Gate qualification, economic ROI modeling, and institutional pursuit memory.
            </p>
          </div>

          {/* FLOATING GLASSMORPHIC LIVE OPPORTUNITY CARD */}
          <div className="p-6 rounded-2xl border border-cyan-500/30 bg-[#0d1428]/90 backdrop-blur-xl shadow-2xl space-y-4 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Government ITMS
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  ✓ Hard Gates Cleared
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-black text-cyan-400">94% Fit Score</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                AI-Powered Smart City Surveillance & Adaptive Traffic Management
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Issued by <span className="text-slate-200 font-semibold">Telangana State Infrastructure Authority</span>
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-[#141b33] border border-slate-800/80">
                <p className="text-[10px] text-slate-400">Contract Value</p>
                <p className="font-bold text-white font-mono mt-0.5">₹24.8 Cr</p>
              </div>
              <div className="p-2 rounded-lg bg-[#141b33] border border-slate-800/80">
                <p className="text-[10px] text-slate-400">Runway</p>
                <p className="font-bold text-emerald-400 font-mono mt-0.5">14 Days Left</p>
              </div>
              <div className="p-2 rounded-lg bg-[#141b33] border border-slate-800/80">
                <p className="text-[10px] text-slate-400">Verdict</p>
                <p className="font-bold text-cyan-400 font-mono mt-0.5">PURSUE (4.8x)</p>
              </div>
            </div>

            {/* Capability Match Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">#ComputerVision</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">#EdgeAI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">#ISO27001</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">#MSME</span>
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
              <span className="text-white font-bold block text-sm">8 Dimensions</span>
              <span className="text-[10px] text-slate-500 uppercase">Fit Engine</span>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <span>© 2026 OpportunityOS</span>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH CARD PANEL */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 md:p-12 relative z-10">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0b1020]/90 backdrop-blur-2xl border border-slate-800/90 shadow-[0_25px_80px_rgba(0,0,0,0.85)] relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white fill-current" />
            </div>
            <span className="text-base font-bold text-white">
              Opportunity<span className="text-cyan-400">OS</span>
            </span>
          </div>

          <Suspense fallback={<div className="text-sm text-slate-400 py-12 text-center">Initializing authentication form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
