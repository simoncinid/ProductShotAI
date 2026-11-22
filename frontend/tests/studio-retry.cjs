const { chromium, webkit } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path')
const { mock } = require('./studio-fixtures.cjs')
const base = process.env.STUDIO_BASE || 'http://localhost:3010',
  out = process.env.STUDIO_OUT || '/tmp/productshot-studio-after'
fs.mkdirSync(out, { recursive: true })
;(async () => {
  const b = await (
    process.env.STUDIO_ENGINE === 'webkit' ? webkit : chromium
  ).launch({ headless: true })
  const p = await b.newPage({ viewport: { width: 390, height: 844 } })
  await mock(p, true, 15)
  let ids = [],
    ready = false
  await p.route('**/api/generate-paid', (r) => {
    const id = r.request().postDataJSON().request_id
    ids.push(id)
    return ids.length === 1
      ? r.fulfill({ status: 503, json: { detail: 'Response interrupted' } })
      : r.fulfill({ json: { generation_id: id, status: 'processing' } })
  })
  await p.route('**/api/generations/*', (r) =>
    r.fulfill({
      json: {
        id: ids[0],
        status: ready ? 'completed' : 'processing',
        output_image_url: ready ? base + '/images/product1.png' : null,
      },
    }),
  )
  await p.goto(base + '/dashboard/create')
  await p
    .getByLabel('Product photo', { exact: true })
    .setInputFiles(path.resolve(__dirname, '../public/images/product1.png'))
  await p.getByRole('button', { name: 'Choose a style', exact: true }).click()
  await p.getByRole('button', { name: 'Review my photo', exact: true }).click()
  await p.getByRole('button', { name: 'Create my photo · 1 credit' }).click()
  await p
    .getByRole('button', { name: 'Retry connection safely', exact: true })
    .waitFor()
  await p.screenshot({
    path: out + '/390-connection-retry.png',
    fullPage: true,
  })
  ready = true
  await p
    .getByRole('button', { name: 'Retry connection safely', exact: true })
    .click()
  await p.getByRole('dialog').waitFor()
  assert.equal(ids.length, 2)
  assert.ok(ids[0] && ids[0] === ids[1])
  console.log(
    'PASS interrupted response: explicit retry reuses the same durable request ID, then recovers the result.',
  )
  await b.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
