'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerationsNoProductRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/generations')
  }, [router])
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-gray-400">
      Redirecting to Generations...
    </div>
  )
}
