'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/lib/api'

export default function DashboardPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    retry: false,
  })

  if (isLoading) return <div className="text-muted py-4">Loading...</div>

  return (
    <div>
      {/* Credits Card */}
      <div className="bg-brand rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-on-brand mb-1">
              {user?.credits_balance || 0} Credits
            </h2>
            <p className="text-on-brand/90">
              1 credit = 4K image, 2 credits = 8K image
            </p>
          </div>
          <Link
            href="/pricing"
            className="bg-primary text-on-dark px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 transition"
          >
            Buy Credits
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Link
          href="/dashboard/create"
          className="bg-surface border border-muted-dark/60 text-on-dark p-6 rounded-lg hover:bg-surface/80 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Generate New Image</h3>
          <p className="text-muted">
            Create a new AI-powered product photo
          </p>
        </Link>
        <Link
          href="/pricing"
          className="bg-cream border-2 border-muted p-6 rounded-lg hover:bg-muted/10 transition"
        >
          <h3 className="text-xl font-semibold mb-2 text-primary">Buy Credits</h3>
          <p className="text-muted-dark">
            Purchase credit packs to generate more images
          </p>
        </Link>
      </div>

      {/* Product Photoshooting - full width */}
      <Link
        href="/dashboard/shooting"
        className="block w-full bg-brand text-on-brand p-6 rounded-lg hover:opacity-90 transition mb-8"
      >
        <h3 className="text-xl font-semibold mb-2">Generate product photoshooting</h3>
        <p className="text-on-brand/90">
          Create a full product photo set (2–10 shots) with consistent style: zoom on details, lifestyle, studio, mix. Choose the product, a reference photo and AI-generated prompts.
        </p>
      </Link>
    </div>
  )
}

