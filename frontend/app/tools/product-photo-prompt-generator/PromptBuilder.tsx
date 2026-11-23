"use client";

import { useEffect, useRef, useState } from "react";
import { trackFunnel } from "@/lib/funnel";
import { StartPhotoCTA } from "@/components/StartPhotoCTA";

const templates = {
  candle: {
    label: "Candle",
    product: "a candle in a white ceramic jar",
    details: "beige label, matching ceramic lid",
    scene: "lifestyle",
  },
  bottle: {
    label: "Water bottle",
    product: "a reusable sage green water bottle",
    details: "metal screw cap, smooth matte finish",
    scene: "lifestyle",
  },
  bag: {
    label: "Leather bag",
    product: "a brown leather handbag",
    details: "brass buckles, structured silhouette, stitched handles",
    scene: "hero",
  },
  skincare: {
    label: "Skincare",
    product: "a skincare bottle",
    details: "original printed label, glass container and pump",
    scene: "catalog",
  },
} as const;
const scenes = {
  catalog:
    "Place the product on a plain white background with soft diffused light and a subtle natural shadow. Keep the full product visible.",
  lifestyle:
    "Place the product on a simple table beside a window, in a calm everyday setting. Use natural light and restrained props.",
  hero: "Create a studio product scene with directional soft light and a warm neutral background. Keep the product as the main focus.",
  social:
    "Create a colourful product scene with a simple background and empty space above the product for text to be added later. Do not generate text.",
} as const;
const field =
  "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20";

export default function PromptBuilder() {
  const [product, setProduct] = useState<string>(templates.candle.product);
  const [details, setDetails] = useState<string>(templates.candle.details);
  const [scene, setScene] = useState<keyof typeof scenes>("lifestyle");
  const [ratio, setRatio] = useState("1:1");
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const output = useRef<HTMLTextAreaElement>(null);

  function chooseTemplate(key: keyof typeof templates) {
    const template = templates[key];
    setProduct(template.product);
    setDetails(template.details);
    setScene(template.scene);
    setPrompt("");
    setCopied(false);
    setCopyError(false);
  }
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("template");
    if (key && Object.prototype.hasOwnProperty.call(templates, key))
      chooseTemplate(key as keyof typeof templates);
  }, []);
  useEffect(() => {
    setPrompt("");
    setCopied(false);
    setCopyError(false);
  }, [product, details, scene, ratio]);
  function build(event: React.FormEvent) {
    event.preventDefault();
    const result = `Use my reference photo of ${product.trim()}. ${scenes[scene]} Preserve the product shape, colour, proportions, branding and packaging.${details.trim() ? ` Keep these details: ${details.trim()}.` : ""} Use ${ratio} framing. Do not add logos, labels or objects that are not in the reference.`;
    setPrompt(result.slice(0, 600));
    setCopied(false);
    setCopyError(false);
    trackFunnel("prompt_builder_used", { scene, ratio });
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setCopyError(false);
      trackFunnel("product_prompt_copied", { scene, ratio });
    } catch {
      output.current?.focus();
      output.current?.select();
      setCopyError(true);
    }
  }
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <form
        onSubmit={build}
        className="rounded-2xl bg-white p-5 text-slate-900 sm:p-7"
      >
        <h2 className="text-2xl font-semibold">1. Describe your photo</h2>
        <p className="mt-3 text-sm text-slate-600">
          Start with an example, then change it to match your own product.
        </p>
        <div
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Product examples"
        >
          {Object.entries(templates).map(([key, template]) => (
            <button
              type="button"
              key={key}
              onClick={() => chooseTemplate(key as keyof typeof templates)}
              className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100"
            >
              {template.label}
            </button>
          ))}
        </div>
        <label
          htmlFor="prompt-product"
          className="mt-6 block text-sm font-semibold"
        >
          What is your product?
          <input
            id="prompt-product"
            required
            maxLength={90}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className={field}
          />
        </label>
        <label
          htmlFor="prompt-details"
          className="mt-5 block text-sm font-semibold"
        >
          Details to keep{" "}
          <span className="font-normal text-slate-500">(optional)</span>
          <input
            id="prompt-details"
            maxLength={100}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Label colour, cap, material, shape…"
            className={field}
          />
        </label>
        <label
          htmlFor="prompt-scene"
          className="mt-5 block text-sm font-semibold"
        >
          Photo style
          <select
            id="prompt-scene"
            value={scene}
            onChange={(e) => setScene(e.target.value as keyof typeof scenes)}
            className={field}
          >
            <option value="catalog">Clean white background</option>
            <option value="lifestyle">Natural lifestyle setting</option>
            <option value="hero">Studio spotlight</option>
            <option value="social">Colourful social image</option>
          </select>
        </label>
        <label
          htmlFor="prompt-ratio"
          className="mt-5 block text-sm font-semibold"
        >
          Image format
          <select
            id="prompt-ratio"
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            className={field}
          >
            <option value="1:1">Square — 1:1</option>
            <option value="4:5">Portrait — 4:5</option>
            <option value="16:9">Wide — 16:9</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={!product.trim()}
          className="mt-6 min-h-12 w-full rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          Build my free prompt
        </button>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Your descriptions stay in this browser. No image upload, email or
          account is needed.
        </p>
      </form>
      <div className="rounded-2xl border border-white/20 bg-neutral-900 p-5 sm:p-7">
        <h2 className="text-2xl font-semibold">2. Copy your prompt</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Use it with your own reference photo in an image tool. This builder
          creates text; it does not generate an image.
        </p>
        {prompt ? (
          <>
            <label
              htmlFor="prompt-output"
              className="mt-5 block text-sm font-semibold"
            >
              Your product photography prompt
            </label>
            <textarea
              ref={output}
              id="prompt-output"
              readOnly
              value={prompt}
              rows={9}
              className={`${field} resize-y leading-relaxed`}
            />
            <p className="mt-2 text-xs text-slate-400">
              {prompt.length}/600 characters · ready for the studio notes field
            </p>
            <button
              type="button"
              onClick={copy}
              className="mt-4 min-h-12 w-full rounded-lg border border-white px-4 py-3 font-semibold hover:bg-white/10"
            >
              {copied ? "Copied ✓" : "Copy prompt"}
            </button>
            <p role="status" className="mt-3 text-sm text-slate-300">
              {copyError
                ? "The prompt is selected. Use your device’s Copy command."
                : copied
                  ? "Prompt copied. Keep it handy when you upload your reference photo."
                  : ""}
            </p>
          </>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-white/25 p-6 text-sm leading-relaxed text-slate-400">
            Choose a product and scene, then press Build my free prompt. Your
            copyable prompt will appear here.
          </div>
        )}
        <div className="mt-7 border-t border-white/15 pt-6">
          <h3 className="text-lg font-semibold">
            Want to create the image here?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Open the photo studio, upload your reference and paste the prompt
            into the optional instructions. Set the same format. A 4K image uses
            1 credit; 8K uses 2.
          </p>
          <StartPhotoCTA placement="prompt_builder" className="mt-5 w-full" />
          <p className="mt-3 text-xs text-slate-400">
            Image generation is paid. Starter: 5 credits for $4.95 USD. No
            subscription.
          </p>
        </div>
      </div>
    </div>
  );
}
