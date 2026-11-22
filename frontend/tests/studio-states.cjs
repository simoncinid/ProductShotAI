const { chromium, webkit } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path')
const { mock } = require('./studio-fixtures.cjs')
const base = process.env.STUDIO_BASE || 'http://localhost:3010',
  out = process.env.STUDIO_OUT || '/tmp/productshot-studio-after'
fs.mkdirSync(out, { recursive: true })
const photo = path.resolve(__dirname, '../public/images/product1.png')
;(async () => {
  const b = await (
    process.env.STUDIO_ENGINE === 'webkit' ? webkit : chromium
  ).launch({ headless: true })
  for (const width of [390, 1440]) {
    const p = await b.newPage({ viewport: { width, height: 844 } })
    await mock(p, true, 15)
    await p.goto(base + '/dashboard/products')
    await p.getByRole('button', { name: 'New product', exact: true }).click()
    await p.getByLabel('Product name *', { exact: true }).waitFor()
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({
      path: out + '/' + width + '-product-new-form.png',
      fullPage: true,
    })
    await p.goto(base + '/dashboard/products/demo-product?edit=1')
    await p.waitForTimeout(150)
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({
      path: out + '/' + width + '-product-edit-form.png',
      fullPage: true,
    })
    await p.goto(base + '/dashboard/shooting')
    await p.getByRole('button', { name: 'Leather bag', exact: true }).click()
    await p.locator('button:has(img)').first().click()
    await p.getByRole('button', { name: 'Next', exact: true }).click()
    await p.getByLabel('Number of images', { exact: true }).fill('2')
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({
      path: out + '/' + width + '-image-set-config.png',
      fullPage: true,
    })
    await p
      .getByRole('button', { name: 'Review image descriptions', exact: true })
      .click()
    await p.getByRole('heading', { name: /Review your/ }).waitFor()
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({
      path: out + '/' + width + '-image-set-review.png',
      fullPage: true,
    })
    await p.close()
  }
  const p = await b.newPage({ viewport: { width: 390, height: 844 } })
  await mock(p, true, 15)
  let uploadFails = true,
    ready = false,
    posts = 0,
    polled = false
  await p.route('**/api/upload', (r) =>
    uploadFails
      ? r.fulfill({
          status: 503,
          json: { detail: 'Upload temporarily unavailable. Please try again.' },
        })
      : r.fulfill({ json: { image_url: base + '/images/product1.png' } }),
  )
  await p.route('**/api/generate-paid', (r) => {
    posts++
    return r.fulfill({
      json: {
        status: 'processing',
        generation_id: r.request().postDataJSON().request_id,
      },
    })
  })
  await p.route('**/api/generations/*', (r) => {
    polled = true
    return r.fulfill({
      json: {
        id: 'resume-generation',
        status: ready ? 'completed' : 'processing',
        output_image_url: ready ? base + '/images/product1.png' : null,
      },
    })
  })
  await p.goto(base + '/dashboard/create')
  await p.getByLabel('Product photo', { exact: true }).setInputFiles(photo)
  await p.getByRole('alert').waitFor()
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.screenshot({ path: out + '/390-upload-error.png', fullPage: true })
  uploadFails = false
  await p
    .getByRole('button', { name: 'Try uploading again', exact: true })
    .click()
  await p.getByRole('button', { name: 'Choose a style', exact: true }).click()
  await p.getByRole('button', { name: 'Review my photo', exact: true }).click()
  await p.getByRole('button', { name: 'Create my photo · 1 credit' }).click()
  await p.getByRole('heading', { name: 'We’re creating your photo' }).waitFor()
  await p.goto(base + '/dashboard/generations')
  await p.goto(base + '/dashboard/create')
  await p.getByRole('heading', { name: 'We’re creating your photo' }).waitFor()
  assert.equal(posts, 1)
  ready = true
  await p.getByRole('dialog').waitFor()
  assert.equal(posts, 1)
  await p.getByRole('button', { name: 'Close result' }).focus()
  await p.keyboard.press('Shift+Tab')
  assert.equal(
    await p.evaluate(() => document.activeElement.textContent),
    'Back to my photo settings',
  )
  await p.keyboard.press('Escape')
  await p.goto(base + '/dashboard/generations')
  await p.route('**/api/user/generations**', (r) =>
    r.fulfill({ status: 503, json: { detail: 'Temporary outage' } }),
  )
  await p.reload()
  await p
    .getByText('We couldn’t load your images. They haven’t been removed.')
    .waitFor()
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.screenshot({ path: out + '/390-library-error.png', fullPage: true })
  console.log(
    'PASS secondary tools: new/edit product, image-set configuration and review, upload error/retry, resume pending generation without a second POST, dialog keyboard trap, library error.',
  )
  await b.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
