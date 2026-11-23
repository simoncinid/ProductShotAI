# Studio browser regression checks

These checks use synthetic accounts and intercepted API responses. They do not send emails, buy credits, or submit real provider jobs. Image downloading is exercised with a real local static file. Screenshots are written to `STUDIO_OUT` (default `/tmp/productshot-studio-after`).

Run the production build and start the app on port 3010. Playwright can be installed outside the application to keep the deployed dependency tree unchanged:

```sh
npm install --prefix /tmp/productshot-ui-qa playwright
node /tmp/productshot-ui-qa/node_modules/playwright/cli.js install chromium webkit
npm --prefix frontend run build
npm --prefix frontend run start -- -p 3010
```

In another terminal, from the repository root:

```sh
NODE_PATH=/tmp/productshot-ui-qa/node_modules node frontend/tests/studio-flow.cjs
NODE_PATH=/tmp/productshot-ui-qa/node_modules node frontend/tests/studio-states.cjs
NODE_PATH=/tmp/productshot-ui-qa/node_modules node frontend/tests/studio-responsive.cjs
NODE_PATH=/tmp/productshot-ui-qa/node_modules node frontend/tests/studio-retry.cjs
```

Set `STUDIO_ENGINE=webkit` to run the same checks on WebKit; set `STUDIO_BASE=https://www.productshotai.com` to inspect the deployed UI with the same synthetic API fixtures. WebKit desktop with mobile viewport sizes is not a physical iPhone camera or native Photos test.

The tests cover the image creation flow, exact visible credit costs, draft restoration, one submission for rapid clicks, pending-job restoration, safe same-ID connection retries, result download, modal focus/escape behavior, invalid file handling, insufficient credits, empty/error states, secondary product/image-set forms, and nine routes at five viewport widths.

## Sales and activation regression checks (23 November)

`NODE_PATH=/tmp/productshot-ui-qa/node_modules node frontend/tests/sales-flow.cjs`

Set `STUDIO_ENGINE=webkit` for WebKit, and `STUDIO_BASE` / `STUDIO_OUT` as above. This check covers the public offer at 320, 390, 768 and 1440px, canonical host and sitemap, duplicate-account recovery links, manual OTP confirmation from an email URL fragment, cross-tab preservation of the selected credit pack, and a synthetic checkout request. No real activation emails or charges are generated. QA analytics are blocked. The real SMTP end-to-end check is a separate controlled audit and uses only an alias of our sender mailbox.
