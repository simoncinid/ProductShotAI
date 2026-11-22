const base = process.env.STUDIO_BASE || 'http://localhost:3010'
const image = base + '/images/product1.png',
  result = base + '/images/res1.png'
const product = {
  id: 'demo-product',
  name: 'Leather bag',
  sku: 'BAG-01',
  category: 'Accessories',
  product_prompt:
    'Brown leather handbag. Preserve its exact shape, colour and details.',
  default_apply_brand_identity: false,
  images: [{ id: 'ref-1', image_url: image }],
  created_at: '2026-11-20T12:00:00Z',
}
const gen = {
  id: 'demo-generation',
  user_id: 'studio-audit',
  product_id: null,
  status: 'completed',
  input_image_url: image,
  output_image_url: result,
  prompt: 'Clean white background.',
  resolution: '4k',
  aspect_ratio: '1:1',
  created_at: '2026-11-20T12:00:00Z',
}
async function mock(p, populated = true, credits = 15) {
  // Keep QA visits out of production analytics.
  await p.route('**/_vercel/insights/**', (route) =>
    route.request().resourceType() === 'script'
      ? route.fulfill({ contentType: 'application/javascript', body: '' })
      : route.fulfill({ status: 204, body: '' }),
  )
  await p.addInitScript(() => {
    localStorage.setItem('auth_token', 'studio-audit-fixture')
    localStorage.setItem('productshotai.analytics-consent', 'denied')
  })
  await p.route('**/api/**', async (r) => {
    const u = new URL(r.request().url()),
      path = u.pathname
    let json = {}
    if (path === '/api/user/me')
      json = {
        id: 'studio-audit',
        email: 'studio-audit@example.invalid',
        credits_balance: credits,
      }
    else if (path === '/api/credits/packs') json = { packs: [] }
    else if (path === '/api/recovery/offer') json = { available: false }
    else if (path === '/api/products') json = populated ? [product] : []
    else if (path === `/api/products/${product.id}`) json = product
    else if (path.includes('/generations'))
      json = /^\/api\/generations\/[^/]+$/.test(path)
        ? { ...gen, id: path.split('/').pop() }
        : {
            items: populated ? [gen] : [],
            total: populated ? 1 : 0,
            page: 1,
            pages: 1,
          }
    else if (path === '/api/brand-identity') {
      if (!populated)
        return r.fulfill({ status: 404, json: { detail: 'No brand identity' } })
      json = {
        id: 'brand',
        average_customer: 'Online shoppers',
        sales_channels: 'Online store',
        price_range: 'Premium',
        lighting_style: 'Soft natural light',
        photo_style: ['Clean'],
        color_palette: 'Warm neutrals',
        brand_notes: 'Simple and warm',
        images: [],
        analysis_text: 'Warm neutral look.',
      }
    } else if (path === '/api/upload') json = { image_url: image }
    else if (path === '/api/generate-paid')
      json = {
        status: 'processing',
        generation_id: r.request().postDataJSON().request_id || gen.id,
      }
    else if (path.includes('/shooting/'))
      json = {
        id: 'demo-shooting',
        status: 'completed',
        prompts: ['Clean background'],
        generations: [gen],
        product_id: product.id,
        reference_image_url: image,
      }
    else if (path.includes('/prompts'))
      json = { prompts: ['Clean background', 'Natural light scene'] }
    else if (path === '/api/shooting') json = []
    return r.fulfill({ json })
  })
}

module.exports = { mock, product, gen }
