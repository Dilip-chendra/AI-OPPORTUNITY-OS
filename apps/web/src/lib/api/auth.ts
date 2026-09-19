import { api } from './client'
import type { User } from '@/types'

export interface SignupData { email: string; password: string; full_name: string; organization_name: string }
export interface LoginData { email: string; password: string }
export interface AuthResult { user: User; access_token: string; token_type: string; expires_in: number }

export const authApi = {
  signup: (data: SignupData) => api.post<AuthResult>('/auth/signup', data).then(r => r.data),
  login: (data: LoginData) => api.post<AuthResult>('/auth/login', data).then(r => r.data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me').then(r => r.data),
  forgotPassword: (email: string) =>
    api.post<{ message: string; reset_token?: string; reset_url?: string }>('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (data: { token: string; new_password: string }) =>
    api.post<{ message: string }>('/auth/reset-password', data).then(r => r.data),
}
