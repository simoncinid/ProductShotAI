"use client";

import Link from "next/link";
import { useAuthenticated } from "@/lib/auth";
import { trackFunnel } from "@/lib/funnel";

export function StartPhotoCTA({
  placement,
  className = "",
}: {
  placement: string;
  className?: string;
}) {
  const authenticated = useAuthenticated();
  return (
    <Link
      href={authenticated ? "/dashboard/create" : "/pricing?pack=starter"}
      onClick={() =>
        trackFunnel("photo_cta_clicked", { placement, pack: "starter" })
      }
      className={`inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${className}`}
    >
      {authenticated
        ? "Open your photo studio →"
        : "Start with 5 credits — $4.95 →"}
    </Link>
  );
}
