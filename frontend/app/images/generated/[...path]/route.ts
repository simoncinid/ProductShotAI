import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Proxy per le immagini generate: /images/generated/xxx -> backend /storage/xxx
 * Come per /images/before1.png ma inoltrate al backend (stessa origine, niente CORS).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = params
  if (!path?.length) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 })
  }
  const filePath = path.join('/')
  const base = API_URL.replace(/\/$/, '')
  const url = `${base}/storage/${filePath}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      return new NextResponse(null, { status: res.status })
    }
    const blob = await res.blob()
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (e) {
    console.error('[images/generated] proxy error:', e)
    return new NextResponse(null, { status: 502 })
  }
}
