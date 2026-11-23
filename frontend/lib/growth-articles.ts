export const growthArticles: Record<
  string,
  {
    title: string;
    date: string;
    excerpt: string;
    image: string;
    referenceImage?: string;
    content: string;
  }
> = {
  "candle-product-photography-at-home": {
    title: "Candle Product Photography at Home: A Simple Shot Plan",
    date: "2026-11-23",
    excerpt:
      "A practical setup for photographing your candle with a phone, a five-image shot list, and two optional AI scene prompts. See a reference and an AI-generated example.",
    image: "/images/candleAfter1.png",
    referenceImage: "/images/candleBefore.png",
    content: `
      <p>A candle listing needs to show what the buyer will receive: the container, label, lid and scale. Start with one accurate reference photo. Then decide which extra scenes explain the product rather than simply decorate the page.</p>
      <p>This guide uses a white candle jar as an example. The reference and AI illustration above are examples, not customer results or evidence of higher sales.</p>
      <h2>1. Build a simple window-light setup</h2>
      <p>Place the candle on a table near a window, with daylight arriving from the side. Turn off nearby lamps if they give the scene a different colour. Use a plain white or neutral background. A sheet of white card opposite the window can soften a dark shadow; use what you already have.</p>
      <p>Keep the phone steady, clean its lens and photograph from the jar’s height. Tap the label to focus and lower the exposure if the white container loses its detail. Take a second frame with slightly different exposure rather than relying on a filter to fix a badly lit photo.</p>
      <p>For a broader beginner setup, Shopify’s <a href="https://www.shopify.com/blog/12206313-the-ultimate-diy-guide-to-beautiful-product-photography" target="_blank" rel="noreferrer">DIY product photography guide</a> covers a phone, window light and a simple background.</p>
      <h2>2. Capture these five useful images</h2>
      <ol>
        <li><strong>Front reference:</strong> the whole jar and its readable label, on a simple background.</li>
        <li><strong>Lid and packaging:</strong> show the actual items included. Avoid suggesting a gift box is included if it is sold separately.</li>
        <li><strong>Texture detail:</strong> photograph the wax, wick and container finish close enough to inspect.</li>
        <li><strong>Scale:</strong> include a real hand or clearly state dimensions beside your photo. Do not rely on an AI scene to prove size.</li>
        <li><strong>One lifestyle scene:</strong> show a plausible place to use the candle, with a clear, uncluttered view of the product.</li>
      </ol>
      <h2>3. Photograph the actual packaging before making variations</h2>
      <p>Save your clean front photo before experimenting. If a generated image changes the label, jar shape or lid, compare it with that reference. An attractive scene is not useful if it shows a different item.</p>
      <p>For an exact label or a detail that affects the purchase decision, use your original photograph. AI scenes are an optional way to explore backgrounds and mood, not a substitute for documenting the real product.</p>
      <h2>4. Try a restrained lifestyle prompt</h2>
      <p>Upload your reference photo and start with one setting. Here is a copyable example:</p>
      <blockquote>Use my reference photo of a candle in a white ceramic jar. Place it on a wooden bedside table with soft window light and a neutral wall. Keep the label, jar shape, colour and lid unchanged. Keep props in the background and the full product visible. Do not add text or packaging.</blockquote>
      <p>For a clean catalog direction:</p>
      <blockquote>Use my candle reference. Create a front-facing product photo on a plain white background with soft diffused light and a subtle shadow. Preserve the original jar, label, colours and proportions. Show only items present in the reference. Square framing.</blockquote>
      <p>You can adapt either instruction in the <a href="/tools/product-photo-prompt-generator?template=candle">free product photography prompt generator</a>. It creates text without an account or an image-generation charge.</p>
      <h2>5. Review the result at thumbnail and full size</h2>
      <ul>
        <li>At thumbnail size, can you recognise the candle and separate it from the background?</li>
        <li>At full size, is every label character correct? Are the rim, wick and lid believable?</li>
        <li>Are colour and texture close to the real item, without invented accessories?</li>
        <li>Does the scene imply a size or an included item you cannot deliver?</li>
      </ul>
      <p>Keep the real reference and the useful variations together. Upload only the images you have checked. If you want to create a scene in ProductShotAI, the guided studio accepts JPG or PNG references up to 10 MB. Choose 4K for 1 credit or 8K for 2; Starter contains 5 credits for $4.95 USD, with no subscription.</p>
      <h2>Questions candle sellers ask</h2>
      <h3>Can I start with a phone photo?</h3><p>Yes. A sharp, well-lit image with the entire jar visible is a useful starting point. Readable text and a clear product outline matter more than an elaborate set.</p>
      <h3>Should I add props to the main product photo?</h3><p>Keep an accurate, simple image of the actual product in your set. Use extra scenes to show atmosphere. Check the current image rules of the marketplace where you sell before choosing the main image.</p>
      <h3>Can AI preserve the exact candle label?</h3><p>It can try, but it is not guaranteed. Inspect the text and packaging against the original. If exact label fidelity is essential, use your real photo for that image.</p>
      <p>Related: <a href="/blog/ai-product-photography-prompts">product photography prompts with worked examples</a> and <a href="/how-it-works">the three-step photo studio workflow</a>.</p>
    `,
  },
  "ai-product-photography-prompts": {
    title: "AI Product Photography Prompts: 4 Worked Examples",
    date: "2026-11-23",
    excerpt:
      "Build a useful product photo prompt from a reference, scene, lighting and framing. Four examples for catalog, lifestyle, skincare and social images, plus a free prompt builder.",
    image: "/images/ugcAfter1.png",
    content: `
      <p>A useful product photo prompt describes the scene you want while identifying the details that should stay unchanged. Start with a clear reference photo. A long list of words such as “premium” or “cinematic” cannot replace a visible product or a readable label.</p>
      <p>The examples here are starting instructions for a reference-image workflow. They are not guaranteed results, and they do not replace your image tool’s resolution or aspect-ratio settings.</p>
      <h2>A simple prompt structure</h2>
      <p>Use this order: <strong>reference product → setting → lighting → composition → details to preserve → exclusions</strong>. Describe one image at a time. Once it is useful, change one element to make another variation.</p>
      <blockquote>Use my reference photo of [product]. Place it in [setting]. Use [lighting]. Frame it as [composition]. Preserve [specific details]. Do not add [unwanted elements].</blockquote>
      <p>The <a href="/tools/product-photo-prompt-generator">free product photography prompt generator</a> builds this structure for you. It works without signup and lets you copy the text into the image tool you choose.</p>
      <h2>Example 1: a clean catalog photo</h2>
      <blockquote>Use my reference photo of a brown leather handbag. Place the bag on a plain white background with soft diffused light and a subtle natural shadow. Keep the full bag and handles visible. Preserve the leather colour, brass buckles, stitching and proportions. Do not add text, logos or accessories.</blockquote>
      <p><strong>Use it for:</strong> exploring a simple product-page image. Choose a square format in the tool if that is the crop you need. A white-looking background is not proof of compliance with a marketplace’s exact background or main-image rules.</p>
      <h2>Example 2: a candle lifestyle scene</h2>
      <blockquote>Use my reference photo of a white candle jar. Place it on a small wooden table beside a window, with a neutral wall behind it. Use soft daylight and a calm composition. Preserve the jar shape, label, wax colour and lid. Keep decorative props behind the product. Do not add text or new packaging.</blockquote>
      <p><strong>Use it for:</strong> a secondary scene or seasonal creative idea. Keep a real photograph for exact packaging and dimensions. See the <a href="/blog/candle-product-photography-at-home">candle photo shot plan</a> before preparing your reference.</p>
      <h2>Example 3: a skincare studio image</h2>
      <blockquote>Use my skincare bottle reference. Create a studio image on a warm neutral surface with a softly lit background. Keep the pump and full container visible. Preserve the bottle shape, label layout, original colours and glass finish. Add a gentle shadow. Do not invent label text, ingredients or claims.</blockquote>
      <p><strong>Use it for:</strong> testing a cleaner visual setting. Inspect every character in the label and any reflection that could distort the container. Do not treat generated packaging as evidence of product ingredients or benefits.</p>
      <h2>Example 4: a social-first water bottle scene</h2>
      <blockquote>Use my reference photo of a sage green water bottle. Show it held in one hand beside a desk, with a softly blurred laptop in the background. Use natural window light. Keep the cap, bottle colour and proportions consistent with the reference. Leave space above the product. Do not add text or logos.</blockquote>
      <p><strong>Use it for:</strong> exploring a casual lifestyle still image. In-hand AI imagery is not a real customer endorsement. Check hands, cap geometry and apparent scale carefully. More examples: <a href="/use-cases/ugc-product-images">UGC-style product images</a>.</p>
      <h2>How to fix an unhelpful result</h2>
      <ul>
        <li><strong>The product changed:</strong> simplify the scene, use a clearer reference and name the specific features to preserve. If it still changes, use the original photo for fidelity-critical details.</li>
        <li><strong>The background is too busy:</strong> remove extra props and request a single surface with a softly blurred background.</li>
        <li><strong>The crop is wrong:</strong> set the actual format in the image tool, then describe where the full product should sit in that frame.</li>
        <li><strong>The label is gibberish:</strong> check that the reference text is legible. Do not publish invented text; use the real photo if exact lettering cannot be retained.</li>
        <li><strong>The image feels inconsistent:</strong> keep the same reference, light direction and setting while changing only one instruction.</li>
      </ul>
      <h2>Use a prompt in ProductShotAI</h2>
      <ol><li>Open the photo studio and upload your JPG or PNG reference, up to 10 MB.</li><li>Choose a matching visual style and paste your instruction into the optional notes field. Keep it under 600 characters.</li><li>Set square, portrait or wide format in the studio. Choose 4K for 1 credit or 8K for 2.</li><li>Review the cost and create one image. Check the result before downloading it for your store.</li></ol>
      <p>Starter is a one-time $4.95 USD pack with 5 credits. The free prompt builder does not spend credits; creating an image in the studio does. Learn about <a href="/pricing">credit packs</a> or build a prompt with the <a href="/tools/product-photo-prompt-generator">free tool</a>.</p>
    `,
  },
};
