const { chromium, webkit } = require('playwright'),
  assert = require('node:assert/strict')
const { mock } = require('./studio-fixtures.cjs')
const base = process.env.STUDIO_BASE || 'http://localhost:3010'
;(async () => {
  const b = await (
    process.env.STUDIO_ENGINE === 'webkit' ? webkit : chromium
  ).launch({ headless: true })
  for (const width of [320, 390, 768, 1024, 1440]) {
    const p = await b.newPage({ viewport: { width, height: 844 } })
    await mock(p, true, 15)
    let errors = []
    p.on('pageerror', (e) => errors.push(e.message))
    for (const route of [
      'dashboard',
      'dashboard/create',
      'dashboard/products',
      'dashboard/products/demo-product',
      'dashboard/brand-identity',
      'dashboard/generations',
      'dashboard/shooting',
      'dashboard/shooting/demo-shooting',
      'dashboard/hub?generation_id=demo-generation',
    ]) {
      await p.goto(base + '/' + route)
      await p.waitForTimeout(150)
      const overflow = await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      )
      assert.equal(overflow, false, route + ' overflows at ' + width)
      if (width < 1024) {
        assert.equal(
          await p
            .getByRole('navigation', { name: 'Studio navigation' })
            .getByRole('link')
            .count(),
          3,
        )
      }
    }
    assert.deepEqual(errors, [])
    console.log(
      'PASS ' +
        width +
        'px: 9 studio routes, no overflow or JS errors, 3 mobile primary links',
    )
    await p.close()
  }
  await b.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
