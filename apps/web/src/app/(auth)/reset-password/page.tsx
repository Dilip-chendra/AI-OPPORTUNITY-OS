'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Zap, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get('token') || ''

  const [token, setToken] = useState(tokenFromUrl)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) {
      setError('A valid reset token is required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await authApi.resetPassword({
        token: token.trim(),
        new_password: password
      })
      setSuccess(true)
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 2000)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(detail || err.message || 'Failed to reset password. The link or token may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>
        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-4">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-1)]">Create New Password</h2>
        <p className="mt-2 text-sm text-[var(--text-2)]">
          Please enter a secure new password for your account.
        </p>
      </div>

      {success ? (
        <div className="p-5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-900 dark:text-green-300 text-sm space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">Password Reset Successfully</h3>
          <p className="text-xs text-green-800 dark:text-green-300">
            Redirecting you to the sign in page...
          </p>
          <div className="pt-2">
            <Link
              href="/login?reset=success"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!tokenFromUrl && (
            <Input
              label="Reset Token"
              placeholder="Paste your reset token here"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
            />
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Updating Password...' : 'Save New Password'}
          </Button>

          <div className="text-center text-sm text-[var(--text-2)] pt-2">
            Remembered your password?{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen w-full">
      <div className="hidden lg:flex w-1/2 bg-[#0A0F1E] flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold mb-8">
            <Zap className="h-8 w-8 text-blue-500" /> OpportunityOS
          </div>
          <h1 className="text-5xl font-bold leading-tight max-w-xl">
            Update Your Credentials
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-lg">
            Keep your business profile and opportunity pipeline secure.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--bg)]">
        <Suspense fallback={<div className="text-sm text-slate-400">Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
