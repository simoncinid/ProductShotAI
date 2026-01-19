'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { setAuthToken } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const signupMutation = useMutation({
    mutationFn: () => authApi.signup(email, password, verifyPassword),
    onSuccess: (data) => {
      setAuthToken(data.access_token)
      toast.success('Account created successfully!')
      router.push('/dashboard')
    },
    onError: (error: unknown) => {
      const msg = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      toast.error(msg || 'Signup failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== verifyPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions')
      return
    }
    signupMutation.mutate()
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-page-bg px-6 py-12 md:py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[20px] border border-gray-100 bg-white p-8 shadow-soft md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-script text-2xl text-primary md:text-3xl">Create account</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
            <h1 className="mt-3 text-[24px] font-bold text-primary md:text-[28px]">Create your account</h1>
            <p className="mt-2 text-[15px] text-secondary">
              Or{' '}
              <Link href="/login" className="font-semibold text-brand hover:underline">sign in to your existing account</Link>
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
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-primary placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label htmlFor="verify-password" className="mb-1.5 block text-[14px] font-medium text-primary">
                Verify password
              </label>
              <input
                id="verify-password"
                name="verify-password"
                type="password"
                autoComplete="new-password"
                required
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-primary placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand focus:ring-2 focus:ring-brand/20"
              />
              <label htmlFor="terms" className="text-[14px] text-secondary">
                I agree to the{' '}
                <Link href="/terms" className="font-semibold text-brand hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="font-semibold text-brand hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={signupMutation.isPending || !acceptedTerms}
              className="w-full rounded-full bg-brand py-3.5 text-[15px] font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover disabled:opacity-50"
            >
              {signupMutation.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
