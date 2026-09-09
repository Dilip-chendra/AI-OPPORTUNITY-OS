'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Settings, User, Palette, Shield, CreditCard, Sun, Moon } from 'lucide-react'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState(user?.full_name || '')

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-[var(--border)] text-[var(--text-1)]">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)]">Settings</h1>
          <p className="text-xs sm:text-sm text-[var(--text-2)]">Manage account profile, system appearances, security, and team preferences.</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile & Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security & Auth</TabsTrigger>
          <TabsTrigger value="billing">Plan & Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <h3 className="font-bold text-base text-[var(--text-1)]">Personal Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={name || user?.full_name || ''} onChange={(e) => setName(e.target.value)} />
              <Input label="Email Address" value={user?.email || ''} disabled helperText="Email is bound to your primary organization login" />
              <Input label="Organization" value={user?.organization_name || 'My Organization'} disabled />
              <Input label="Role" value={user?.role || 'Owner'} disabled />
            </div>
            <div className="pt-4 flex justify-between items-center border-t border-[var(--border)]">
              <Button size="sm">Update Profile</Button>
              <Button variant="danger" size="sm" onClick={logout}>Sign Out</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
            <h3 className="font-bold text-base text-[var(--text-1)]">Theme Preference</h3>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border)] bg-[var(--bg)]'
                }`}
              >
                <Moon className="h-6 w-6 text-blue-500" />
                <span className="text-xs font-bold text-[var(--text-1)]">Dark Mode</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  theme === 'light' ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border)] bg-[var(--bg)]'
                }`}
              >
                <Sun className="h-6 w-6 text-amber-500" />
                <span className="text-xs font-bold text-[var(--text-1)]">Light Mode</span>
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <h3 className="font-bold text-base text-[var(--text-1)]">Security & Sessions</h3>
            <p className="text-xs text-[var(--text-2)]">Protected by stateless JSON Web Tokens (HS256) with auto-rotating refresh cookies.</p>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-[var(--text-1)]">Active JWT Session</p>
                <p className="text-[var(--text-3)]">Expiring in 30 minutes with rolling refresh token.</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <h3 className="font-bold text-base text-[var(--text-1)]">Subscription Plan</h3>
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-blue-500">Current Tier</span>
                <h4 className="text-xl font-extrabold text-[var(--text-1)]">Professional Plan</h4>
                <p className="text-xs text-[var(--text-2)]">Unlimited opportunity discovery with AI match scoring.</p>
              </div>
              <Button size="sm">Manage Plan</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
