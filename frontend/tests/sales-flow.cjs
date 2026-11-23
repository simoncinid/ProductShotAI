// Synthetic conversion QA: no real emails, charges, or generation requests.
const { chromium, webkit } = require("playwright"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const base = process.env.STUDIO_BASE || "http://localhost:3010";
const out = process.env.STUDIO_OUT || "artifacts/sales-20261123/after";
fs.mkdirSync(out, { recursive: true });
const packs = [
  {
    id: "starter",
    name: "Starter",
    total_price: 4.95,
    credits: 5,
    price_per_credit: 0.99,
  },
  {
    id: "standard",
    name: "Standard",
    total_price: 13.35,
    credits: 15,
    price_per_credit: 0.89,
  },
];
(async () => {
  const browser = await (
    process.env.STUDIO_ENGINE === "webkit" ? webkit : chromium
  ).launch();
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    await context.addInitScript(() =>
      localStorage.setItem("productshotai.analytics-consent", "denied"),
    );
    await context.route("**/_vercel/insights/**", (r) => r.abort());
    let verifyCalls = 0,
      checkoutCalls = 0;
    await context.route("**/api/**", (r) => {
      const path = new URL(r.request().url()).pathname;
      if (path === "/api/credits/packs") return r.fulfill({ json: { packs } });
      if (path === "/api/auth/signup")
        return r.fulfill({
          status: 400,
          json: { detail: "Email already registered" },
        });
      if (path === "/api/auth/verify-otp") {
        verifyCalls++;
        assert.deepEqual(r.request().postDataJSON(), {
          email: "audit+mobile@example.com",
          otp: "012345",
        });
        return r.fulfill({ json: { access_token: "fixture-only" } });
      }
      if (path === "/api/user/me")
        return r.fulfill({
          json: {
            id: "sales-test",
            email: "audit+mobile@example.com",
            credits_balance: 0,
          },
        });
      if (path === "/api/recovery/offer")
        return r.fulfill({ json: { available: false } });
      if (path === "/api/credits/purchase") {
        checkoutCalls++;
        assert.equal(r.request().postDataJSON().pack_id, "starter");
        return r.fulfill({
          status: 503,
          json: { detail: "Synthetic checkout stopped before payment" },
        });
      }
      return r.fulfill({ json: {} });
    });
    const p = await context.newPage(),
      errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    for (const [name, path] of [
      ["home", "/"],
      ["pricing", "/pricing?pack=starter"],
      ["ugc", "/use-cases/ugc-product-images"],
      ["how", "/how-it-works"],
    ]) {
      await p.goto(base + path, { waitUntil: "networkidle" });
      assert.equal(await p.locator("h1").count(), 1);
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${name} overflow at ${width}`,
      );
      assert.equal(
        new URL(await p.locator("link[rel=canonical]").getAttribute("href"))
          .hostname,
        "www.productshotai.com",
      );
      await p.screenshot({
        path: `${out}/${name}-${width}.png`,
        fullPage: true,
      });
    }
    // Start selected pack, then handle a previously registered address.
    await p.goto(base + "/pricing?pack=starter");
    await p.getByRole("button", { name: "Continue with Starter" }).click();
    await p.waitForURL("**/signup");
    await p.getByLabel("Email address").fill("audit+mobile@example.com");
    await p.getByLabel("Password", { exact: true }).fill("fixture-password");
    await p.getByLabel("Verify password").fill("fixture-password");
    await p.getByRole("checkbox").check();
    await p
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await p.getByRole("link", { name: "Finish activating" }).waitFor();
    await p.screenshot({
      path: `${out}/existing-account-${width}.png`,
      fullPage: true,
    });
    // Mail opened in a fresh tab: fragment is scrubbed, no automatic verification.
    const mail = await context.newPage();
    await mail.goto(
      base + "/verifyEmail#email=audit%2Bmobile%40example.com&code=012345",
      { waitUntil: "networkidle" },
    );
    assert.equal(
      await mail.getByLabel("Email address").inputValue(),
      "audit+mobile@example.com",
    );
    assert.equal(
      await mail.getByLabel("Verification code").inputValue(),
      "012345",
    );
    assert.equal(new URL(mail.url()).hash, "");
    assert.equal(verifyCalls, 0);
    await mail.screenshot({
      path: `${out}/activation-${width}.png`,
      fullPage: true,
    });
    await mail.getByRole("button", { name: "Verify", exact: true }).click();
    await mail.waitForURL("**/pricing?pack=starter");
    await mail.getByRole("button", { name: "Continue with Starter" }).click();
    await mail.getByText("Synthetic checkout stopped before payment").waitFor();
    assert.equal(verifyCalls, 1);
    assert.equal(checkoutCalls, 1);
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      `PASS ${width}: layouts, canonical, duplicate-account recovery, new-tab activation, selected-pack checkout`,
    );
  }
  const page = await browser.newPage();
  const sitemap = await (await page.request.get(base + "/sitemap.xml")).text();
  assert(!sitemap.includes("/create<"));
  assert(!sitemap.includes("https://productshotai.com"));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
