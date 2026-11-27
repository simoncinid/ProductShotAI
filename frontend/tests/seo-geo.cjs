const { chromium, webkit } = require("playwright"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const base = process.env.STUDIO_BASE || "http://localhost:3010",
  out = process.env.STUDIO_OUT || "artifacts/sales-20261127";
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await (
    process.env.STUDIO_ENGINE === "webkit" ? webkit : chromium
  ).launch();
  const request = await b.newPage();
  for (const route of ["/pricing", "/about"]) {
    const context = await b.newContext({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
      }),
      p = await context.newPage();
    await p.goto(base + route);
    assert.equal(await p.locator("h1").count(), 1);
    for (const price of ["$4.95", "$13.35", "$31.60", "$69.00"])
      assert(
        (await p.locator("main").innerText()).includes(price),
        `${price} not visible without JS on ${route}`,
      );
    const schemas = (
      await p.locator('script[type="application/ld+json"]').allTextContents()
    ).map(JSON.parse);
    const app = schemas.find((s) => s["@type"] === "SoftwareApplication");
    assert(app);
    assert.equal(app.offers.length, 4);
    assert.equal(app.offers[0].priceCurrency, "USD");
    assert.equal(app.offers[0].price, "4.95");
    assert(!app.aggregateRating);
    await p.screenshot({
      path: `${out}/no-js-${route.slice(1)}.png`,
      fullPage: true,
    });
    await context.close();
  }
  for (const route of [
    "/login",
    "/signup",
    "/verifyEmail",
    "/recover",
    "/unsubscribe",
  ]) {
    const response = await request.request.get(base + route),
      html = await response.text();
    assert(/name="robots"[^>]*noindex/.test(html), route + " missing noindex");
    assert(
      html.includes(
        `rel="canonical" href="https://www.productshotai.com${route}"`,
      ),
      route + " inherits incorrect canonical",
    );
  }
  await request.goto(base + '/faq');
  const faqSchema=(await request.locator('script[type="application/ld+json"]').allTextContents()).map(JSON.parse).find(x=>x['@type']==='FAQPage');
  assert(faqSchema && faqSchema.mainEntity.length===12);
  const faqText=await request.locator('main').textContent();
  for(const item of faqSchema.mainEntity){assert(faqText.includes(item.name));assert(faqText.includes(item.acceptedAnswer.text));}
  assert.equal(await request.locator('footer a[href="/privacy"]').count(),1);
  assert.equal(await request.locator('footer a[href="/about"]').count(),1);
  const dashHtml=await(await request.request.get(base+'/dashboard/create')).text();assert(/name="robots"[^>]*noindex/.test(dashHtml));
  const robots = await (await request.request.get(base + "/robots.txt")).text();
  for (const agent of [
    "Googlebot",
    "bingbot",
    "OAI-SearchBot",
    "PerplexityBot",
  ])
    assert(robots.includes(agent));
  assert(robots.includes("Disallow: /dashboard"));
  assert(robots.includes("Sitemap: https://www.productshotai.com/sitemap.xml"));
  const sitemap = await (
    await request.request.get(base + "/sitemap.xml")
  ).text();
  assert(sitemap.includes("https://www.productshotai.com/about"));
  assert(!sitemap.includes("/dashboard"));
  await b.close();
  console.log(
    "PASS no-JS commercial content and real prices, truthful structured data, private noindex/canonical, crawler access and sitemap",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
