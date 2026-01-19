'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { setAuthToken } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get('email') || ''
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  useEffect(() => {
    if (emailFromQuery) setEmail(decodeURIComponent(emailFromQuery))
  }, [emailFromQuery])

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verifyOtp(email, otp),
    onSuccess: (data) => {
      setAuthToken(data.access_token)
      toast.success('Email verified! Welcome to ProductShotAI.')
      router.push('/dashboard')
    },
    onError: (error: unknown) => {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Verification failed')
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp(email),
    onSuccess: () => toast.success('New code sent to your email'),
    onError: (error: unknown) => {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Could not resend code')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }
    if (otp.length !== 6 || !/^[0-9]+$/.test(otp)) {
      toast.error('Enter the 6-digit code')
      return
    }
    verifyMutation.mutate()
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-page-bg px-6 py-12 md:py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[20px] border border-gray-100 bg-white p-8 shadow-soft md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-script text-2xl text-primary md:text-3xl">Verify email</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
            <h1 className="mt-3 text-[24px] font-bold text-primary md:text-[28px]">Verify your email</h1>
            <p className="mt-2 text-[15px] text-secondary">
              Enter the 6-digit code we sent to your inbox to activate your ProductShotAI account.
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
              <label htmlFor="otp" className="mb-1.5 block text-[14px] font-medium text-primary">
                Verification code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-[18px] tracking-[0.4em] text-primary placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <button
              type="submit"
              disabled={verifyMutation.isPending || otp.length !== 6 || !email.trim()}
              className="w-full rounded-full bg-brand py-3.5 text-[15px] font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover disabled:opacity-50"
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
            </button>

            <p className="text-center text-[14px] text-secondary">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending || !email.trim()}
                className="font-semibold text-brand hover:underline disabled:opacity-50"
              >
                {resendMutation.isPending ? 'Sending...' : 'Resend code'}
              </button>
            </p>
          </form>

          <p className="mt-6 text-center text-[14px] text-secondary">
            <Link href="/login" className="font-semibold text-brand hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
