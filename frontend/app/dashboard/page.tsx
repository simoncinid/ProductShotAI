'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/lib/api'
// import { getAbsoluteImageUrl } from '@/lib/api' // per Recent Generations
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) {
      router.push('/login')
    }
  }, [authenticated, router])

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: authenticated,
    retry: false,
  })

  // Recent Generations: disattivato (commentato)
  // const { data: generations, isLoading: gensLoading } = useQuery({
  //   queryKey: ['generations'],
  //   queryFn: () => userApi.getGenerations(1, 10),
  //   enabled: authenticated,
  // })

  if (!authenticated || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-rich-black mb-2">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-gray-600">Manage your product photos and credits</p>
      </div>

      {/* Credits Card */}
      <div className="bg-vivid-yellow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-rich-black mb-1">
              {user?.credits_balance || 0} Credits
            </h2>
            <p className="text-rich-black opacity-80">
              Each credit = 1 high-quality 8K image
            </p>
          </div>
          <Link
            href="/pricing"
            className="bg-rich-black text-white px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 transition"
          >
            Buy Credits
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/dashboard/create"
          className="bg-rich-black text-white p-6 rounded-lg hover:bg-opacity-90 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Generate New Image</h3>
          <p className="text-gray-300">
            Create a new AI-powered product photo
          </p>
        </Link>
        <Link
          href="/pricing"
          className="bg-white border-2 border-rich-black p-6 rounded-lg hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2 text-rich-black">Buy Credits</h3>
          <p className="text-gray-600">
            Purchase credit packs to generate more images
          </p>
        </Link>
      </div>

      {/* Recent Generations — disattivato (commentato). Per riattivare: decommentare useQuery generations, import getAbsoluteImageUrl e questo blocco. */}
      {/* <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-rich-black">Recent Generations</h2>
          {generations && generations.total > 0 && (
            <Link
              href="/dashboard/history"
              className="text-vivid-yellow hover:underline"
            >
              View All
            </Link>
          )}
        </div>

        {gensLoading ? (
          <p className="text-gray-600">Loading generations...</p>
        ) : generations && generations.items.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {generations.items.map((gen: any) => (
              <div
                key={gen.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {gen.output_image_url ? (
                  <img
                    src={getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url}
                    alt="Generated"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">{gen.status}</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{gen.prompt}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                    {gen.output_image_url && (
                      <a
                        href={getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url}
                        download
                        className="text-vivid-yellow hover:underline"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-4">No generations yet</p>
            <Link
              href="/dashboard/create"
              className="inline-block bg-vivid-yellow text-rich-black px-6 py-3 rounded-md font-semibold hover:bg-opacity-90"
            >
              Create Your First Image
            </Link>
          </div>
        )}
      </div> */}
    </div>
  )
}
