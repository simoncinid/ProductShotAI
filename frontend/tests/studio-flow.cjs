const { chromium, webkit } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('fs')
const { mock } = require('./studio-fixtures.cjs')
const base = process.env.STUDIO_BASE || 'http://localhost:3010',
  out = process.env.STUDIO_OUT || '/tmp/productshot-studio-after'
fs.mkdirSync(out, { recursive: true })
;(async () => {
  const b = await (
    process.env.STUDIO_ENGINE === 'webkit' ? webkit : chromium
  ).launch({ headless: true })
  for (const width of [390, 1440]) {
    const p = await b.newPage({
      viewport: { width, height: width === 390 ? 844 : 1000 },
    })
    await mock(p, true, 15)
    let requests = [],
      polls = 0,
      errors = []
    p.on('pageerror', (e) => errors.push(e.message))
    p.on('request', (r) => {
      if (r.url().endsWith('/api/generate-paid'))
        requests.push(r.postDataJSON())
    })
    await p.route('**/api/generations/*', (r) =>
      r.fulfill({
        json:
          ++polls < 2
            ? { id: 'demo-generation', status: 'processing' }
            : {
                id: 'demo-generation',
                status: 'completed',
                output_image_url: base + '/images/product1.png',
              },
      }),
    )
    await p.goto(base + '/dashboard/create')
    await p
      .getByRole('heading', { name: 'Create a product photo', exact: true })
      .waitFor()
    assert.ok(
      await p
        .getByRole('button', { name: 'Choose a style', exact: true })
        .isDisabled(),
    )
    await p
      .getByLabel('Product photo', { exact: true })
      .setInputFiles(
        require('node:path').resolve(
          __dirname,
          '../public/images/product1.png',
        ),
      )
    await p
      .getByText('Your photo is ready. Next, choose its new look.')
      .waitFor()
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({
      path: out + '/' + width + '-flow-1-uploaded.png',
      fullPage: true,
    })
    await p.getByRole('button', { name: 'Choose a style', exact: true }).click()
    await p.getByRole('button', { name: /Natural setting/ }).click()
    await p.getByRole('button', { name: /Portrait/ }).click()
    await p.getByRole('button', { name: /8K · 2 credits/ }).click()
    await p
      .getByText('Add your own instructions (optional)', { exact: true })
      .click()
    await p
      .getByLabel(
        'Describe any changes in your own words. No technical instructions needed.',
      )
      .fill('On a wooden table near a window.')
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({
      path: out + '/' + width + '-flow-2-style.png',
      fullPage: true,
    })
    await p
      .getByRole('button', { name: 'Review my photo', exact: true })
      .click()
    await p.getByText('This image uses 2 credits', { exact: true }).waitFor()
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({
      path: out + '/' + width + '-flow-3-review.png',
      fullPage: true,
    })
    await p.reload()
    await p
      .getByText(
        'Your previous photo and choices have been restored. You can continue where you left off.',
      )
      .waitFor()
    await p.getByRole('button', { name: /Review & create/ }).click()
    await p.getByText('This image uses 2 credits', { exact: true }).waitFor()
    await p
      .getByRole('button', { name: 'Create my photo · 2 credits' })
      .evaluate((e) => {
        e.click()
        e.click()
      })
    await p
      .getByRole('heading', { name: 'We’re creating your photo' })
      .waitFor()
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({
      path: out + '/' + width + '-flow-4-processing.png',
      fullPage: true,
    })
    await p.getByRole('dialog').waitFor()
    assert.equal(requests.length, 1)
    assert.equal(requests[0].resolution, '8k')
    assert.equal(requests[0].aspect_ratio, '4:5')
    assert.ok(requests[0].prompt.includes('wooden table'))
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({
      path: out + '/' + width + '-flow-5-result.png',
      fullPage: false,
    })
    const [download] = await Promise.all([
      p.waitForEvent('download'),
      p.getByRole('button', { name: 'Download photo', exact: true }).click(),
    ])
    assert.ok((await download.suggestedFilename()).endsWith('.png'))
    await p.keyboard.press('Escape')
    assert.equal(await p.getByRole('dialog').count(), 0)
    assert.equal(await p.evaluate(() => document.body.style.overflow), '')
    assert.deepEqual(errors, [])
    console.log(
      'PASS ' +
        width +
        'px: upload → visual choices → 2-credit review → draft reload → one generation → processing → result → real file download → Escape',
    )
    await p.close()
  }
  const p = await b.newPage({ viewport: { width: 320, height: 812 } })
  await mock(p, false, 0)
  let requests = 0
  p.on('request', (r) => {
    if (r.url().endsWith('/api/generate-paid')) requests++
  })
  await p.goto(base + '/dashboard/create')
  await p.getByLabel('Product photo', { exact: true }).setInputFiles({
    name: 'wrong.gif',
    mimeType: 'image/gif',
    buffer: Buffer.from('gif'),
  })
  await p
    .getByText(
      'Please choose a JPG or PNG photo. HEIC photos need to be saved as JPG first.',
    )
    .waitFor()
  await p
    .getByLabel('Product photo', { exact: true })
    .setInputFiles(
      require('node:path').resolve(__dirname, '../public/images/product1.png'),
    )
  await p.getByRole('button', { name: 'Choose a style', exact: true }).click()
  await p.getByRole('button', { name: 'Review my photo', exact: true }).click()
  await p.getByRole('link', { name: /View credit packs/ }).waitFor()
  assert.equal(
    await p.getByRole('button', { name: /Create my photo/ }).count(),
    0,
  )
  assert.equal(requests, 0)
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.screenshot({
    path: out + '/320-no-credits-review.png',
    fullPage: true,
  })
  await p.goto(base + '/dashboard')
  assert.equal(await p.getByText('Catalog hero', { exact: true }).count(), 0)
  assert.ok(
    await p
      .getByRole('link', { name: 'Create a product photo', exact: true })
      .count(),
  )
  console.log(
    'PASS 320px: invalid file rejected, zero credits explained before purchase, generation blocked, no fabricated recent images',
  )
  await b.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
