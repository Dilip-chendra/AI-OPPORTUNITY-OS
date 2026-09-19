'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import Link from 'next/link'
import { Zap } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const resetSuccess = searchParams.get('reset') === 'success'

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
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
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login({ email, password })
      localStorage.setItem('access_token', res.access_token)
      document.cookie = `access_token=${res.access_token}; path=/; max-age=86400; SameSite=Lax`
      if (res.user) {
        setUser(res.user)
      }
      router.push('/overview')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(detail || (err.response?.status === 401 ? 'Invalid email or password.' : err.message || 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[var(--text-1)]">Welcome back</h2>
        <p className="mt-2 text-[var(--text-2)]">Sign in to your account</p>
      </div>

      {resetSuccess && (
        <div className="p-3 text-sm rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
          Password reset successful! Please sign in with your new password.
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium" style={{ color: 'var(--text-1)' }}>
              Password
            </label>
            <Link
              href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="text-xs text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        {error && (
          <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 space-y-1">
            <div>{error}</div>
            {error.includes('Invalid email or password') && (
              <div className="text-xs text-slate-300 pt-1">
                Forgot your password?{' '}
                <Link
                  href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="text-blue-400 hover:underline font-medium"
                >
                  Reset it here
                </Link>
              </div>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm text-[var(--text-2)] pt-2 border-t border-[var(--border)]">
        <span>Don't have an account? <Link href="/signup" className="text-blue-500 hover:underline font-medium">Sign up</Link></span>
        <Link href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="text-xs text-[var(--text-3)] hover:text-blue-500 hover:underline">
          Reset password
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full">
      <div className="hidden lg:flex w-1/2 bg-[#0A0F1E] flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold mb-8">
            <Zap className="h-8 w-8 text-blue-500" /> OpportunityOS
          </div>
          <h1 className="text-5xl font-bold leading-tight max-w-xl">
            Discover. Decide. Capture.
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-lg">
            The intelligence layer for business opportunities.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--bg)]">
        <Suspense fallback={<div className="text-sm text-slate-400">Loading sign in form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

