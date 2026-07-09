import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const FAKE_AUTH = process.env.NEXT_PUBLIC_FAKE_AUTH === '1'

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

const fakeUser = {
  id: 'fake-user',
  email: 'demo@productshotai.local',
  credits_balance: 120,
}

const fakeProducts = [
  {
    id: 'product-1',
    name: 'Serum Bottle',
    sku: 'DEMO-SERUM',
    category: 'Skincare',
    default_apply_brand_identity: true,
    product_prompt: 'Premium glass serum bottle with clean label, reflective cap, preserved packaging geometry.',
    images: [
      { id: 'product-1-img-1', image_url: '/images/product1.png' },
      { id: 'product-1-img-2', image_url: '/images/cosmeticBefore.png' },
    ],
  },
  {
    id: 'product-2',
    name: 'Leather Bag',
    sku: 'DEMO-BAG',
    category: 'Accessories',
    default_apply_brand_identity: true,
    product_prompt: 'Structured leather crossbody bag, warm brown texture, premium lifestyle ecommerce composition.',
    images: [
      { id: 'product-2-img-1', image_url: '/images/before1.png' },
      { id: 'product-2-img-2', image_url: '/images/before2.png' },
    ],
  },
]

const fakeGenerations = [
  {
    id: 'fake-gen-1',
    status: 'completed',
    output_image_url: '/images/res1.png',
    prompt: 'Cinematic product hero shot with directional studio light.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fake-gen-2',
    status: 'completed',
    output_image_url: '/images/res2.png',
    prompt: 'Editorial ecommerce scene with premium props and soft contrast.',
    created_at: new Date().toISOString(),
  },
]

function fakeGenerationPage() {
  return {
    items: fakeGenerations,
    total: fakeGenerations.length,
    page: 1,
    page_size: 20,
    pages: 1,
  }
}

/**
 * Restituisce un URL usabile per <img> e download, gestito come /images/before1.png:
 * - /storage/xxx → /images/generated/xxx (stessa origine, proxy verso il backend)
 * - https?://... → invariato (S3/CloudFront già assoluti)
 */
export function getAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/storage') || url.startsWith('/storage/'))
    return url.replace(/^\/storage\/?/, '/images/generated/')
  const base = API_URL.replace(/\/$/, '')
  return `${base}${url.startsWith('/') ? url : '/' + url}`
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const deviceId = localStorage.getItem('device_id')
    if (deviceId) {
      config.headers['X-Device-ID'] = deviceId
    }
  }
  return config
})

// Auth
export const authApi = {
  signup: async (email: string, password: string, verifyPassword: string) => {
    if (FAKE_AUTH) {
      await delay()
      return { access_token: 'fake-dev-token', token_type: 'bearer', email }
    }
    const response = await api.post('/api/auth/signup', {
      email,
      password,
      verify_password: verifyPassword,
    })
    return response.data
  },
  verifyOtp: async (email: string, otp: string) => {
    if (FAKE_AUTH) {
      await delay()
      return { access_token: 'fake-dev-token', token_type: 'bearer', email, otp }
    }
    const response = await api.post('/api/auth/verify-otp', { email, otp })
    return response.data
  },
  resendOtp: async (email: string) => {
    if (FAKE_AUTH) {
      await delay()
      return { ok: true, email }
    }
    const response = await api.post('/api/auth/resend-otp', { email })
    return response.data
  },
  login: async (email: string, password: string) => {
    if (FAKE_AUTH) {
      await delay()
      return { access_token: 'fake-dev-token', token_type: 'bearer', email, password }
    }
    const response = await api.post('/api/auth/login', {
      email,
      password,
    })
    return response.data
  },
  logout: async () => {
    if (FAKE_AUTH) {
      await delay(100)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      return
    }
    await api.post('/api/auth/logout')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  },
}

// User
export const userApi = {
  getMe: async () => {
    if (FAKE_AUTH) {
      await delay()
      return fakeUser
    }
    const response = await api.get('/api/user/me')
    return response.data
  },
  getGenerations: async (page: number = 1, pageSize: number = 20) => {
    if (FAKE_AUTH) {
      await delay()
      return { ...fakeGenerationPage(), page, page_size: pageSize }
    }
    const response = await api.get('/api/user/generations', {
      params: { page, page_size: pageSize },
    })
    return response.data
  },
}

// Prompt edit with AI (no auth required)
export const promptApi = {
  edit: async (originalPrompt: string, editInstructions: string) => {
    const response = await api.post('/api/prompt/edit', {
      original_prompt: originalPrompt,
      edit_instructions: editInstructions,
    })
    return response.data as { edited_prompt: string }
  },
}

// Brand Identity (auth required)
export const brandIdentityApi = {
  get: async () => {
    if (FAKE_AUTH) {
      await delay()
      return {
        id: 'fake-brand',
        average_customer: 'Premium ecommerce buyers who value clean, cinematic product presentation.',
        sales_channels: 'Amazon, Shopify, paid social',
        price_range: '$40-$120',
        lighting_style: 'Directional studio light, deep contrast, crisp highlights',
        brand_notes: 'Minimal, editorial, high-trust visuals with neutral sets and restrained copy.',
        analysis_text: 'Fake brand profile ready for local testing.',
        images: [{ id: 'brand-img-1', image_url: '/images/res3.png' }],
      }
    }
    const response = await api.get('/api/brand-identity')
    return response.data
  },
  createOrUpdate: async (data: {
    average_customer?: string
    sales_channels?: string
    price_range?: string
    lighting_style?: string
    photo_style?: Record<string, unknown>
    color_palette?: Record<string, unknown>
    brand_notes?: string
    analysis_text?: string
  }) => {
    if (FAKE_AUTH) {
      await delay()
      return { id: 'fake-brand', ...data }
    }
    const response = await api.post('/api/brand-identity', data)
    return response.data
  },
  uploadImage: async (file: File) => {
    if (FAKE_AUTH) {
      await delay()
      return { id: crypto.randomUUID(), image_url: URL.createObjectURL(file) }
    }
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/brand-identity/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  deleteImage: async (imageId: string) => {
    if (FAKE_AUTH) {
      await delay()
      return { ok: true, imageId }
    }
    const response = await api.delete(`/api/brand-identity/images/${imageId}`)
    return response.data
  },
  analyze: async () => {
    if (FAKE_AUTH) {
      await delay()
      return { analysis_text: 'Cinematic, minimal, high-contrast product direction.' }
    }
    const response = await api.post('/api/brand-identity/analyze')
    return response.data
  },
  delete: async () => {
    if (FAKE_AUTH) {
      await delay()
      return { ok: true }
    }
    const response = await api.delete('/api/brand-identity')
    return response.data
  },
}

// Products (auth required)
export const productsApi = {
  list: async () => {
    if (FAKE_AUTH) {
      await delay()
      return fakeProducts
    }
    const response = await api.get('/api/products')
    return response.data
  },
  get: async (id: string) => {
    if (FAKE_AUTH) {
      await delay()
      return fakeProducts.find((product) => product.id === id) ?? fakeProducts[0]
    }
    const response = await api.get(`/api/products/${id}`)
    return response.data
  },
  create: async (data: {
    name: string
    sku?: string
    category?: string
    default_apply_brand_identity: boolean
    product_prompt: string
  }) => {
    if (FAKE_AUTH) {
      await delay()
      return { id: crypto.randomUUID(), images: [], ...data }
    }
    const response = await api.post('/api/products', data)
    return response.data
  },
  update: async (id: string, data: {
    name?: string
    sku?: string
    category?: string
    default_apply_brand_identity?: boolean
    product_prompt?: string
    analysis_text?: string
  }) => {
    if (FAKE_AUTH) {
      await delay()
      return { ...(fakeProducts.find((product) => product.id === id) ?? fakeProducts[0]), ...data }
    }
    const response = await api.put(`/api/products/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    if (FAKE_AUTH) {
      await delay()
      return { ok: true, id }
    }
    const response = await api.delete(`/api/products/${id}`)
    return response.data
  },
  uploadImage: async (productId: string, file: File) => {
    if (FAKE_AUTH) {
      await delay()
      return { id: crypto.randomUUID(), product_id: productId, image_url: URL.createObjectURL(file) }
    }
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/api/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  deleteImage: async (productId: string, imageId: string) => {
    if (FAKE_AUTH) {
      await delay()
      return { ok: true, productId, imageId }
    }
    const response = await api.delete(`/api/products/${productId}/images/${imageId}`)
    return response.data
  },
  analyze: async (productId: string) => {
    if (FAKE_AUTH) {
      await delay()
      return { product_id: productId, analysis_text: 'Clean product shape, reflective material, suitable for editorial studio scenes.' }
    }
    const response = await api.post(`/api/products/${productId}/analyze`)
    return response.data
  },
  getGenerations: async (productId: string, page: number = 1, pageSize: number = 20) => {
    if (FAKE_AUTH) {
      await delay()
      return { ...fakeGenerationPage(), product_id: productId, page, page_size: pageSize }
    }
    const response = await api.get(`/api/products/${productId}/generations`, {
      params: { page, page_size: pageSize },
    })
    return response.data
  },
}

// Generations: no-product scope (auth required)
export const generationsApi = {
  getNoProduct: async (page: number = 1, pageSize: number = 20) => {
    if (FAKE_AUTH) {
      await delay()
      return { ...fakeGenerationPage(), page, page_size: pageSize }
    }
    const response = await api.get('/api/generations', {
      params: { scope: 'no_product', page, page_size: pageSize },
    })
    return response.data
  },
}

// Upload
export const uploadApi = {
  uploadImage: async (file: File) => {
    if (FAKE_AUTH) {
      await delay()
      return { image_url: URL.createObjectURL(file) }
    }
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

// Generation: POST with WaveSpeed webhook returns 202 immediately; frontend polls getGeneration.
const GENERATE_TIMEOUT_MS = 60_000  // POST è veloce (solo create task), polling è separato

export type GenerationStatus = {
  id: string
  status: string
  output_image_url?: string | null
  error_message?: string | null
  product_id?: string | null
}

// Generation
export const generationApi = {
  generatePaid: async (data: {
    prompt: string
    image_url: string
    aspect_ratio?: string
    resolution?: string
    device_id: string
    product_id?: string | null
    apply_brand_identity?: boolean
    user_prompt_input?: string
  }) => {
    if (FAKE_AUTH) {
      await delay(600)
      return {
        status: 'completed',
        generation_id: 'fake-gen-live',
        output_image_url: data.aspect_ratio === '16:9' ? '/images/res4.png' : '/images/res1.png',
      }
    }
    const response = await api.post('/api/generate-paid', data, { timeout: GENERATE_TIMEOUT_MS })
    return response.data
  },
  /** Polling sullo stato dopo 202. Richiede autenticazione. */
  getGeneration: async (generationId: string, _deviceId?: string): Promise<GenerationStatus> => {
    if (FAKE_AUTH) {
      await delay()
      return {
        id: generationId,
        status: 'completed',
        output_image_url: '/images/res2.png',
      }
    }
    const res = await api.get<GenerationStatus>(`/api/generations/${generationId}`)
    return res.data
  },
}

// Credits
export const creditsApi = {
  getPacks: async () => {
    if (FAKE_AUTH) {
      await delay()
      return {
        packs: [
          { id: 'starter', name: 'Starter', total_price: 4.95, credits: 5, price_per_credit: 0.99 },
          { id: 'standard', name: 'Standard', total_price: 13.35, credits: 15, price_per_credit: 0.89 },
          { id: 'pro', name: 'Pro', total_price: 31.6, credits: 40, price_per_credit: 0.79 },
          { id: 'power', name: 'Power', total_price: 69, credits: 100, price_per_credit: 0.69 },
        ],
      }
    }
    const response = await api.get('/api/credits/packs')
    return response.data
  },
  purchase: async (packId: string, successUrl: string, cancelUrl: string) => {
    if (FAKE_AUTH) {
      await delay()
      return { checkout_url: successUrl, pack_id: packId, cancel_url: cancelUrl }
    }
    const response = await api.post('/api/credits/purchase', {
      pack_id: packId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return response.data
  },
}

// Shooting (product photoshooting)
export const shootingApi = {
  createPrompts: async (data: { product_id: string; shooting_style: string; count: number }) => {
    if (FAKE_AUTH) {
      await delay()
      return {
        prompts: Array.from({ length: data.count }, (_, index) =>
          `Cinematic ${data.shooting_style} product shot ${index + 1}, premium lighting, editorial composition.`,
        ),
      }
    }
    const response = await api.post('/api/shooting/prompts', data)
    return response.data as { prompts: string[] }
  },
  generate: async (data: { product_id: string; reference_image_url: string; prompts: string[]; aspect_ratio?: string; resolution?: string }) => {
    if (FAKE_AUTH) {
      await delay(600)
      return { shooting_id: 'fake-shooting-1', generation_ids: data.prompts.map((_, index) => `fake-shooting-gen-${index + 1}`) }
    }
    const response = await api.post('/api/shooting/generate', {
      ...data,
      aspect_ratio: data.aspect_ratio || '1:1',
      resolution: data.resolution || '4k',
    })
    return response.data as { shooting_id: string; generation_ids: string[] }
  },
  get: async (shootingId: string) => {
    if (FAKE_AUTH) {
      await delay()
      return {
        id: shootingId,
        product_id: 'product-1',
        reference_image_url: '/images/product1.png',
        prompts: ['Cinematic studio product frame', 'Editorial lifestyle frame'],
        status: 'completed',
        created_at: new Date().toISOString(),
        generations: fakeGenerations.map((generation) => ({ ...generation, error_message: null })),
      }
    }
    const response = await api.get(`/api/shooting/${shootingId}`)
    return response.data as {
      id: string
      product_id: string | null
      reference_image_url: string
      prompts: string[]
      status: string
      created_at: string
      generations: Array<{
        id: string
        status: string
        output_image_url: string | null
        error_message: string | null
        prompt: string
        created_at: string
      }>
    }
  },
}

// Device ID helper
export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return ''
  
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}
