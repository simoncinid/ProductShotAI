import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
    const response = await api.post('/api/auth/signup', {
      email,
      password,
      verify_password: verifyPassword,
    })
    return response.data
  },
  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post('/api/auth/verify-otp', { email, otp })
    return response.data
  },
  resendOtp: async (email: string) => {
    const response = await api.post('/api/auth/resend-otp', { email })
    return response.data
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    })
    return response.data
  },
  logout: async () => {
    await api.post('/api/auth/logout')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  },
}

// User
export const userApi = {
  getMe: async () => {
    const response = await api.get('/api/user/me')
    return response.data
  },
  getGenerations: async (page: number = 1, pageSize: number = 20) => {
    const response = await api.get('/api/user/generations', {
      params: { page, page_size: pageSize },
    })
    return response.data
  },
}

// Brand Identity (auth required)
export const brandIdentityApi = {
  get: async () => {
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
  }) => {
    const response = await api.post('/api/brand-identity', data)
    return response.data
  },
  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/brand-identity/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  deleteImage: async (imageId: string) => {
    const response = await api.delete(`/api/brand-identity/images/${imageId}`)
    return response.data
  },
  analyze: async () => {
    const response = await api.post('/api/brand-identity/analyze')
    return response.data
  },
  delete: async () => {
    const response = await api.delete('/api/brand-identity')
    return response.data
  },
}

// Products (auth required)
export const productsApi = {
  list: async () => {
    const response = await api.get('/api/products')
    return response.data
  },
  get: async (id: string) => {
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
    const response = await api.post('/api/products', data)
    return response.data
  },
  update: async (id: string, data: {
    name?: string
    sku?: string
    category?: string
    default_apply_brand_identity?: boolean
    product_prompt?: string
  }) => {
    const response = await api.put(`/api/products/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`)
    return response.data
  },
  uploadImage: async (productId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/api/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  deleteImage: async (productId: string, imageId: string) => {
    const response = await api.delete(`/api/products/${productId}/images/${imageId}`)
    return response.data
  },
  analyze: async (productId: string) => {
    const response = await api.post(`/api/products/${productId}/analyze`)
    return response.data
  },
  getGenerations: async (productId: string, page: number = 1, pageSize: number = 20) => {
    const response = await api.get(`/api/products/${productId}/generations`, {
      params: { page, page_size: pageSize },
    })
    return response.data
  },
}

// Generations: no-product scope (auth required)
export const generationsApi = {
  getNoProduct: async (page: number = 1, pageSize: number = 20) => {
    const response = await api.get('/api/generations', {
      params: { scope: 'no_product', page, page_size: pageSize },
    })
    return response.data
  },
}

// Upload
export const uploadApi = {
  uploadImage: async (file: File) => {
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

// Generation: POST con webhook WaveSpeed ritorna 202 subito; frontend fa polling su getGeneration.
const GENERATE_TIMEOUT_MS = 60_000  // POST è veloce (solo create task), polling è separato

export type GenerationStatus = {
  id: string
  status: string
  output_image_url?: string | null
  error_message?: string | null
}

// Generation
export const generationApi = {
  generateFree: async (data: {
    prompt: string
    image_url: string
    aspect_ratio?: string
    resolution?: string
    device_id: string
  }) => {
    const response = await api.post('/api/generate-free', data, { timeout: GENERATE_TIMEOUT_MS })
    return response.data
  },
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
    const response = await api.post('/api/generate-paid', data, { timeout: GENERATE_TIMEOUT_MS })
    return response.data
  },
  /** Polling sullo stato dopo 202. Per free passare deviceId, per paid usare auth. */
  getGeneration: async (generationId: string, deviceId?: string): Promise<GenerationStatus> => {
    const res = await api.get<GenerationStatus>(`/api/generations/${generationId}`, {
      params: deviceId != null ? { device_id: deviceId } : undefined,
    })
    return res.data
  },
}

// Credits
export const creditsApi = {
  getPacks: async () => {
    const response = await api.get('/api/credits/packs')
    return response.data
  },
  purchase: async (packId: string, successUrl: string, cancelUrl: string) => {
    const response = await api.post('/api/credits/purchase', {
      pack_id: packId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return response.data
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
