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
    if (formData.password !== formData.confirm_password) return setError('Passwords do not match')
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
      setError(err.message || 'Signup failed')
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
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <div className="text-center text-sm text-[var(--text-2)]">
            Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
