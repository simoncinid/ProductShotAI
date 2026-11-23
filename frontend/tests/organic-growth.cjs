const { chromium, webkit } = require("playwright"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const base = process.env.STUDIO_BASE || "http://localhost:3010",
  out = process.env.STUDIO_OUT || "artifacts/sales-20261123/organic";
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await (
    process.env.STUDIO_ENGINE === "webkit" ? webkit : chromium
  ).launch();
  for (const width of [320, 390, 768, 1440]) {
    const context = await b.newContext({ viewport: { width, height: 900 } });
    await context.addInitScript(() => {
      localStorage.setItem("productshotai.analytics-consent", "denied");
      window.qaEvents = [];
      window.gtag = (...args) => window.qaEvents.push(args);
    });
    await context.route("**/_vercel/insights/**", (r) => r.abort());
    const p = await context.newPage();
    let calls = 0;
    await p.route("**/api/**", (r) => {
      calls++;
      return r.fulfill({ json: { packs: [] } });
    });
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    for (const [name, path] of [
      [
        "prompt-builder",
        "/tools/product-photo-prompt-generator?template=bottle",
      ],
      ["candle-guide", "/blog/candle-product-photography-at-home"],
      ["prompt-guide", "/blog/ai-product-photography-prompts"],
      ["blog", "/blog"],
      ["home", "/"],
    ]) {
      const response = await p.goto(base + path, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      assert.equal(await p.locator("h1").count(), 1);
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${name} overflow ${width}`,
      );
      assert.equal(
        new URL(await p.locator("link[rel=canonical]").getAttribute("href"))
          .host,
        "www.productshotai.com",
      );
      await p.screenshot({
        path: `${out}/${name}-${width}.png`,
        fullPage: true,
      });
      if (name.endsWith("guide")) {
        const data = await p
          .locator('script[type="application/ld+json"]')
          .allTextContents();
        assert(
          data
            .map(JSON.parse)
            .some(
              (x) =>
                x["@type"] === "Article" && x.datePublished === "2026-11-23",
            ),
        );
        assert(
          await p
            .getByRole("link", { name: "Build a free prompt", exact: false })
            .count(),
        );
      }
    }
    await p.goto(
      base + "/tools/product-photo-prompt-generator?template=bottle",
      { waitUntil: "networkidle" },
    );
    assert(
      (await p.getByLabel("What is your product?").inputValue()).includes(
        "bottle",
      ),
    );
    await p.getByRole("button", { name: "Build my free prompt" }).click();
    const prompt = await p
      .getByLabel("Your product photography prompt")
      .inputValue();
    assert(prompt.includes("bottle"));
    assert(prompt.length <= 600);
    assert(prompt.includes("1:1"));
    assert.equal(calls, 0, "Free builder must not request any API");
    await p.getByRole("button", { name: "Copy prompt", exact: true }).click();
    await p
      .getByRole("status")
      .filter({ hasText: /copied|selected/ })
      .waitFor();
    await p.screenshot({
      path: `${out}/prompt-result-${width}.png`,
      fullPage: true,
    });
    await p.getByLabel("Image format").selectOption("4:5");
    assert.equal(
      await p.getByLabel("Your product photography prompt").count(),
      0,
    );
    await p.getByRole("button", { name: "Build my free prompt" }).click();
    assert(
      (
        await p.getByLabel("Your product photography prompt").inputValue()
      ).includes("4:5"),
    );
    await p
      .getByLabel("What is your product?")
      .fill('<script>alert("x")</script>');
    await p.getByRole("button", { name: "Build my free prompt" }).click();
    assert(
      (
        await p.getByLabel("Your product photography prompt").inputValue()
      ).includes("<script>"),
    );
    assert.deepEqual(errors, []);
    await p.getByRole("link", { name: "Start with 5 credits" }).click();
    await p.waitForURL("**/pricing?pack=starter");
    await context.close();
    console.log(
      `PASS ${width}: useful public tool, preset, prompt/copy, no API cost, safe input, articles, mobile, paid CTA`,
    );
  }
  const p = await b.newPage();
  const sitemap = await (await p.request.get(base + "/sitemap.xml")).text();
  for (const slug of [
    "tools/product-photo-prompt-generator",
    "blog/candle-product-photography-at-home",
    "blog/ai-product-photography-prompts",
  ])
    assert(sitemap.includes(slug));
  assert.equal(
    (await p.request.get(base + "/blog/does-not-exist")).status(),
    404,
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
