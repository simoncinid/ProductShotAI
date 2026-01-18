'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { creditsApi, userApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function PricingPage() {
  const router = useRouter()
  const authenticated = isAuthenticated()
  const queryClient = useQueryClient()

  const { data: packsData } = useQuery({
    queryKey: ['credit-packs'],
    queryFn: creditsApi.getPacks,
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: authenticated,
    retry: false,
  })

  const purchaseMutation = useMutation({
    mutationFn: creditsApi.purchase,
    onSuccess: (data) => {
      toast.success(`Successfully purchased ${data.credits_added} credits!`)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      if (!authenticated) {
        router.push('/signup')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Purchase failed')
    },
  })

  const handlePurchase = (packId: string) => {
    if (!authenticated) {
      toast.error('Please sign up to purchase credits')
      router.push('/signup')
      return
    }
    purchaseMutation.mutate(packId)
  }

  const packs = packsData?.packs || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-rich-black mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          No monthly subscriptions. Pay only for the images you need.
          The more credits you buy, the less you pay per image.
        </p>
        {authenticated && user && (
          <p className="mt-4 text-lg">
            Your current balance: <span className="font-bold text-vivid-yellow">{user.credits_balance} credits</span>
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {packs.map((pack: any) => (
          <div
            key={pack.id}
            className={`border-2 rounded-lg p-6 ${
              pack.id === 'standard'
                ? 'border-vivid-yellow relative'
                : 'border-gray-200'
            }`}
          >
            {pack.id === 'standard' && (
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-vivid-yellow text-rich-black px-3 py-1 rounded-full text-xs font-semibold">
                POPULAR
              </span>
            )}
            <h3 className="text-2xl font-bold text-rich-black mb-2">{pack.name}</h3>
            <div className="mb-4">
              <div className="text-4xl font-bold text-vivid-yellow mb-1">
                ${pack.total_price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                {pack.credits} credits
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ${pack.price_per_credit.toFixed(2)} per credit
              </div>
            </div>
            <button
              onClick={() => handlePurchase(pack.id)}
              disabled={purchaseMutation.isPending}
              className={`w-full py-3 rounded-md font-semibold transition ${
                pack.id === 'standard'
                  ? 'bg-rich-black text-white hover:bg-opacity-90'
                  : 'bg-vivid-yellow text-rich-black hover:bg-opacity-90'
              } disabled:opacity-50`}
            >
              {purchaseMutation.isPending ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-rich-black mb-4">How Credits Work</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="text-vivid-yellow mr-2">✓</span>
            <span>One credit = one high-quality 8K image generation</span>
          </li>
          <li className="flex items-start">
            <span className="text-vivid-yellow mr-2">✓</span>
            <span>Credits never expire - use them whenever you need</span>
          </li>
          <li className="flex items-start">
            <span className="text-vivid-yellow mr-2">✓</span>
            <span>No monthly fees or subscriptions</span>
          </li>
          <li className="flex items-start">
            <span className="text-vivid-yellow mr-2">✓</span>
            <span>Buy more credits anytime to add to your balance</span>
          </li>
        </ul>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-rich-black mb-4">
          Try It Free First
        </h2>
        <p className="text-gray-600 mb-6">
          Get 3 free watermarked images per month. No credit card required.
        </p>
        <a
          href="/create"
          className="inline-block bg-vivid-yellow text-rich-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition"
        >
          Start Free Trial
        </a>
      </div>
    </div>
  )
}
