'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 5 minutes stale time — data is considered fresh for 5 min after fetching.
        // This prevents refetches on every navigation / component remount.
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes before garbage collecting.
        gcTime: 10 * 60 * 1000,
        // Never refetch on window focus — eliminates the main refresh loop trigger.
        refetchOnWindowFocus: false,
        // Never refetch on reconnect automatically.
        refetchOnReconnect: false,
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 401 || error?.response?.status === 403) return false
          return failureCount < 2
        },
      },
    },
  }))
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
