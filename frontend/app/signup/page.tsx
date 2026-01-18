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
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Signup failed')
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-bold text-rich-black">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-vivid-yellow hover:text-yellow-600">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-vivid-yellow focus:border-vivid-yellow focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-vivid-yellow focus:border-vivid-yellow focus:z-10 sm:text-sm"
                placeholder="Password (min 8 characters)"
              />
            </div>
            <div>
              <label htmlFor="verify-password" className="sr-only">
                Verify Password
              </label>
              <input
                id="verify-password"
                name="verify-password"
                type="password"
                autoComplete="new-password"
                required
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-vivid-yellow focus:border-vivid-yellow focus:z-10 sm:text-sm"
                placeholder="Verify password"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-vivid-yellow focus:ring-vivid-yellow border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link href="/terms" className="text-vivid-yellow hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-vivid-yellow hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={signupMutation.isPending || !acceptedTerms}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-rich-black bg-vivid-yellow hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vivid-yellow disabled:opacity-50"
            >
              {signupMutation.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
