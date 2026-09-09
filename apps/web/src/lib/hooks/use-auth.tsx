'use client'
import React, { useState, useEffect, createContext, useContext } from 'react'
import { authApi } from '@/lib/api/auth'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  logout: async () => {},
  setUser: () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const u = await authApi.me()
      setUser(u)
    } catch {
      localStorage.removeItem('access_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      setUser(null)
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, logout, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
