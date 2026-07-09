'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-black text-white">
      <Image src="/images/res5.jpeg" alt="" fill priority className="object-cover opacity-55" />
      <div className="absolute inset-0 bg-black/70" aria-hidden />

      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-[1600px] grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="hidden min-h-0 flex-col justify-end px-10 pb-12 pt-16 lg:flex">
          <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#a7a7a7]">ProductShotAI Studio</p>
          <h1 className="mt-3 max-w-2xl text-[56px] font-normal leading-none tracking-[-1.2px]">
            Sign in to your production workspace.
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-snug text-[#c9ccd1]">
            Keep product references, brand direction and generated shots in one cinematic workspace.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 md:px-10">
          <div className="w-full max-w-[440px] border border-[#d0d4d4] bg-[#fefefe]/95 p-6 text-[#0c0c0c] backdrop-blur md:p-8">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo1.png" alt="" width={42} height={42} className="object-contain" />
                <span className="text-[13px] font-semibold uppercase tracking-[0.35px] text-[#0c0c0c]">ProductShotAI</span>
              </Link>
              <span className="text-[11px] uppercase tracking-[0.35px] text-[#767d88]">Access</span>
            </div>

            <div className="mt-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#767d88]">Sign in</p>
              <h2 className="mt-2 text-[34px] font-normal leading-none tracking-[-0.9px] text-[#0c0c0c]">
                Continue to Studio
              </h2>
              <p className="mt-3 text-[14px] leading-snug text-[#767d88]">
                Use any email and password in local fake mode. The account opens with demo credits.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-[#404040]">
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
                  placeholder="demo@productshotai.local"
                  className="h-12 w-full rounded border border-[#d0d4d4] bg-white px-3 text-[15px] text-[#0c0c0c] placeholder:text-[#767d88] outline-none transition focus:border-[#0c0c0c]"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-[#404040]">
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
                  placeholder="Any password"
                  className="h-12 w-full rounded border border-[#d0d4d4] bg-white px-3 text-[15px] text-[#0c0c0c] placeholder:text-[#767d88] outline-none transition focus:border-[#0c0c0c]"
                />
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="h-12 w-full rounded bg-[#0c0c0c] text-[14px] font-semibold text-white transition-smooth hover:bg-[#404040] disabled:opacity-50"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#d0d4d4] pt-5 text-[13px]">
              <span className="text-[#767d88]">No account?</span>
              <Link href="/signup" className="font-semibold text-[#0c0c0c] transition hover:text-[#767d88]">
                Create one
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
