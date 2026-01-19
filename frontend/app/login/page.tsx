'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { setAuthToken } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data) => {
      setAuthToken(data.access_token)
      toast.success('Login successful!')
      router.push('/dashboard')
    },
    onError: (error: unknown) => {
      const msg = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      toast.error(msg || 'Login failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate()
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-page-bg px-6 py-12 md:py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[20px] border border-gray-100 bg-white p-8 shadow-soft md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-script text-2xl text-primary md:text-3xl">Sign in</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
            <h1 className="mt-3 text-[24px] font-bold text-primary md:text-[28px]">Sign in to your account</h1>
            <p className="mt-2 text-[15px] text-secondary">
              Or{' '}
              <Link href="/signup" className="font-semibold text-brand hover:underline">create a new account</Link>
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[14px] font-medium text-primary">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-primary placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[14px] font-medium text-primary">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-primary placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-full bg-brand py-3.5 text-[15px] font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
