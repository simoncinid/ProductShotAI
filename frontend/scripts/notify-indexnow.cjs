// Run manually after deployment. Default is a dry run; --submit makes one POST.
// IndexNow receipt acknowledges discovery, never indexing/ranking or Google coverage.
const fs = require("node:fs"),
  path = require("node:path");
const site = "https://www.productshotai.com";
const publicDir = path.resolve(__dirname, "../public");
const keys = fs
  .readdirSync(publicDir)
  .filter((name) => /^[a-f0-9]{32}\.txt$/.test(name));
if (keys.length !== 1)
  throw new Error(
    "Expected one public IndexNow key file; review before submitting.",
  );
const key = fs.readFileSync(path.join(publicDir, keys[0]), "utf8").trim();
if (keys[0] !== key + ".txt")
  throw new Error("Verification file name/content mismatch.");
const urls = [
  "/",
  "/about",
  "/pricing",
  "/how-it-works",
  "/faq",
  "/blog",
  "/blog/candle-product-photography-at-home",
  "/blog/ai-product-photography-prompts",
  "/tools/product-photo-prompt-generator",
].map((p) => site + p);
(async () => {
  const verification = await fetch(`${site}/${keys[0]}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!verification.ok || (await verification.text()).trim() !== key)
    throw new Error("Live verification key unavailable. Deploy first.");
  for (const url of urls) {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      redirect: "manual",
    });
    if (response.status !== 200)
      throw new Error(
        `URL is not a direct HTTP 200: ${url} (${response.status})`,
      );
  }
  if (!process.argv.includes("--submit")) {
    console.log(
      JSON.stringify(
        { dry_run: true, verified_urls: urls.length, urls },
        null,
        2,
      ),
    );
    return;
  }
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(site).hostname,
      key,
      keyLocation: `${site}/${keys[0]}`,
      urlList: urls,
    }),
    signal: AbortSignal.timeout(30000),
  });
  const result = {
    submitted_at: new Date().toISOString(),
    status: response.status,
    received: [200, 202].includes(response.status),
    urls,
    body: (await response.text()).slice(0, 2000),
    note: "Receipt is not an indexing or ranking guarantee; this is not Google submission.",
  };
  const out = path.resolve(__dirname, "../../artifacts/sales-20261127");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    path.join(out, "indexnow-receipt.json"),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
  if (!result.received) process.exitCode = 1;
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
