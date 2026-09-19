'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Zap, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'

function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<{ message: string; reset_token?: string; reset_url?: string } | null>(null)

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail)
    }
  }, [initialEmail, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authApi.forgotPassword(email.trim())
      setSuccessData(res)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(detail || err.message || 'Failed to process password reset request.')
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
          <KeyRound className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-1)]">Reset Password</h2>
        <p className="mt-2 text-sm text-[var(--text-2)]">
          Enter the email address associated with your account, and we'll generate a secure reset link.
        </p>
      </div>

      {successData ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-900 dark:text-green-300 text-sm space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Reset Request Processed
            </div>
            <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
              {successData.message}
            </p>
          </div>

          {successData.reset_token && (
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] space-y-3">
              <div className="text-xs font-medium text-[var(--text-1)]">
                Secure Reset Link Available:
              </div>
              <p className="text-xs text-[var(--text-3)]">
                Click below to set your new password immediately:
              </p>
              <Button
                onClick={() => router.push(`/reset-password?token=${encodeURIComponent(successData.reset_token!)}`)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                Proceed to Set New Password
              </Button>
            </div>
          )}

          <div className="pt-2 text-center text-sm">
            <Link href="/login" className="text-blue-500 hover:underline">
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Generating Reset Link...' : 'Continue'}
          </Button>

          <div className="text-center text-sm text-[var(--text-2)] pt-2">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex h-screen w-full">
      <div className="hidden lg:flex w-1/2 bg-[#0A0F1E] flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold mb-8">
            <Zap className="h-8 w-8 text-blue-500" /> OpportunityOS
          </div>
          <h1 className="text-5xl font-bold leading-tight max-w-xl">
            Account Recovery
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-lg">
            Securely restore access to your Opportunity Operating System workspace.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--bg)]">
        <Suspense fallback={<div className="text-sm text-slate-400">Loading recovery form...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
