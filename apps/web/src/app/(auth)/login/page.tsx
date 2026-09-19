'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useAuth()

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
      setError(detail || (err.response?.status === 401 ? 'Invalid email or password. If you do not have an account yet, please sign up below.' : err.message || 'Login failed'))
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
            Discover. Decide. Capture.
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-lg">
            The intelligence layer for business opportunities.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--bg)]">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-1)]">Welcome back</h2>
            <p className="mt-2 text-[var(--text-2)]">Sign in to your account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && (
              <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-[var(--text-2)]">
            Don't have an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
