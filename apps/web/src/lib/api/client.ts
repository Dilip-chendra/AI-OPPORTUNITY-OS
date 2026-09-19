import axios, { AxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Mutex: prevent concurrent 401s from each triggering a separate refresh call.
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

function onRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token))
  pendingRequests = []
}

let isRedirecting = false

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Don't intercept refresh calls themselves
    if (original.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            if (original.headers) original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      isRefreshing = true
      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
        const { access_token } = res.data
        localStorage.setItem('access_token', access_token)
        if (typeof document !== 'undefined') {
          document.cookie = `access_token=${access_token}; path=/; max-age=86400; SameSite=Lax`
        }
        if (original.headers) original.headers.Authorization = `Bearer ${access_token}`
        onRefreshed(access_token)
        return api(original)
      } catch {
        pendingRequests = []
        localStorage.removeItem('access_token')
        if (typeof window !== 'undefined') {
          document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax'
          if (!isRedirecting && window.location.pathname !== '/login') {
            isRedirecting = true
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
