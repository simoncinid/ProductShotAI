"use client";

import { gaEvent } from "./ga";
import { track } from "@vercel/analytics";

const RETURN_KEY = "productshotai.authReturnTo";

export function rememberPurchase(packId: string) {
  const path = `/pricing?pack=${encodeURIComponent(packId)}`;
  try {
    sessionStorage.setItem(RETURN_KEY, path);
  } catch {}
  // Verification emails commonly open in another tab. Carry only the pack,
  // for one hour, without any email, token or other account information.
  try {
    localStorage.setItem(
      RETURN_KEY,
      JSON.stringify({ path, expires: Date.now() + 3600000 }),
    );
  } catch {}
}

export function authDestination() {
  let path: string | null = null;
  try {
    path = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
  } catch {}
  try {
    const saved = JSON.parse(localStorage.getItem(RETURN_KEY) || "null");
    localStorage.removeItem(RETURN_KEY);
    if (!path && saved?.expires > Date.now()) path = saved.path;
  } catch {}
  if (path && /^\/pricing\?pack=(starter|standard|pro|power)$/.test(path))
    return path;
  return "/dashboard/create";
}

// Never send emails, prompts, tokens, or reference images to analytics.
export function trackFunnel(
  event: string,
  properties?: Record<string, string | number | boolean>,
) {
  const names: Record<string, string> = {
    signup_completed: "sign_up",
    login_completed: "login",
    checkout_created: "begin_checkout",
  };
  gaEvent(names[event] || event, properties);
  try {
    track(event, properties);
  } catch {
    /* Analytics must not block the product. */
  }
}
