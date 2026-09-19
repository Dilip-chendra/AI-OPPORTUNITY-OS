'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function SignupPage() {
  const [formData, setFormData] = useState({ full_name: '', organization_name: '', email: '', password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useAuth()

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
    <div className="flex h-screen w-full">
      <div className="hidden lg:flex w-1/2 bg-[#0A0F1E] flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold mb-8">
            <Zap className="h-8 w-8 text-blue-500" /> OpportunityOS
          </div>
          <h1 className="text-5xl font-bold leading-tight max-w-xl">
            Start discovering opportunities.
          </h1>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--bg)] overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto py-8">
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-1)]">Create an account</h2>
            <p className="mt-2 text-[var(--text-2)]">Join thousands of opportunity-driven businesses</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <Input label="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            <Input label="Organization" value={formData.organization_name} onChange={e => setFormData({...formData, organization_name: e.target.value})} required />
            <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            <Input label="Confirm Password" type="password" value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} required />
            {error === '__email_exists__' ? (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-sm space-y-3 animate-in fade-in duration-200">
                <div className="font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                  Account already exists
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  An account is already registered with <strong>{formData.email}</strong>. You don't need to create a new one.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    href={`/login?email=${encodeURIComponent(formData.email)}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors shadow-sm"
                  >
                    Sign In to Your Account
                  </Link>
                  <Link
                    href={`/forgot-password?email=${encodeURIComponent(formData.email)}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-1)] font-medium text-xs hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
            ) : error ? (
              <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <div className="flex items-center justify-between text-sm text-[var(--text-2)] pt-2 border-t border-[var(--border)]">
            <span>Already have an account? <Link href="/login" className="text-blue-500 hover:underline font-medium">Sign in</Link></span>
            <Link href="/forgot-password" className="text-xs text-[var(--text-3)] hover:text-blue-500 hover:underline">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
