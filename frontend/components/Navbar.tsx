"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userApi, authApi } from "@/lib/api";
import { useAuthenticated, clearAuth } from "@/lib/auth";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/tools/product-photo-prompt-generator", label: "Free tool" },
  { href: "/blog", label: "Blog" },
  { href: "/create", label: "Create" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authenticated = useAuthenticated();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: userApi.getMe,
    enabled: authenticated === true,
    retry: false,
  });

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    clearAuth();
    router.push("/");
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b border-[#27272a] bg-black/92 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 md:px-10 lg:px-14">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/logo1.png"
            alt=""
            width={50}
            height={50}
            className="object-contain"
          />
          <span className="text-[14px] font-semibold uppercase tracking-[0.35px] text-white">
            ProductShotAI
          </span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden items-center gap-1 xl:flex">
          {authenticated ? (
            <>
              <Link
                href="/how-it-works"
                className={`px-3 py-2 text-[14px] font-medium transition hover:text-white ${isActive("/how-it-works") ? "text-white font-semibold" : "text-muted"}`}
              >
                How it works
              </Link>
              <Link
                href="/use-cases"
                className={`px-3 py-2 text-[14px] font-medium transition hover:text-white ${isActive("/use-cases") ? "text-white font-semibold" : "text-muted"}`}
              >
                Use cases
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-2 text-[14px] font-medium transition hover:text-white ${isActive("/pricing") ? "text-white font-semibold" : "text-muted"}`}
              >
                Pricing
              </Link>
              <Link
                href="/tools/product-photo-prompt-generator"
                className={`px-3 py-2 text-[14px] font-medium transition hover:text-white ${isActive("/tools") ? "text-white font-semibold" : "text-muted"}`}
              >
                Free tool
              </Link>
              <Link
                href="/faq"
                className={`px-3 py-2 text-[14px] font-medium transition hover:text-white ${isActive("/faq") ? "text-white font-semibold" : "text-muted"}`}
              >
                FAQ
              </Link>
              <Link
                href="/blog"
                className={`px-3 py-2 text-[14px] font-medium transition hover:text-white ${isActive("/blog") ? "text-white font-semibold" : "text-muted"}`}
              >
                Blog
              </Link>
              <Link
                href="/dashboard/create"
                className={`px-3 py-2 text-[14px] font-medium transition hover:text-white ${isActive("/dashboard/create") ? "text-white font-semibold" : "text-muted"}`}
              >
                Create
              </Link>
              {user && (
                <span className="px-3 py-2 text-[14px] text-muted">
                  Credits:{" "}
                  <span className="font-semibold text-white">
                    {user.credits_balance}
                  </span>
                </span>
              )}
              <Link
                href="/dashboard"
                className="ml-2 rounded bg-white px-5 py-2.5 text-[14px] font-semibold text-black transition-smooth hover:bg-[#e9ecf2]"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-[14px] font-medium text-muted transition hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 text-[14px] font-medium transition hover:text-white ${isActive(href) ? "text-white font-semibold" : "text-muted"}`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/login"
                className="ml-2 rounded border border-[#27272a] bg-transparent px-6 py-2.5 text-[14px] font-semibold text-white transition-smooth hover:bg-[#1a1a1a]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded bg-white px-6 py-2.5 text-[14px] font-semibold text-black transition-smooth hover:bg-[#e9ecf2]"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="xl:hidden flex h-11 w-11 items-center justify-center rounded text-white hover:bg-white/10"
          aria-label="Menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-navigation"
        className={`absolute inset-x-0 top-full z-40 h-[calc(100dvh-72px)] overflow-y-auto bg-black xl:hidden ${
          isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        } transition-all duration-200`}
      >
        <nav className="flex flex-col gap-1 px-6 py-6">
          {authenticated ? (
            <>
              <Link
                href="/how-it-works"
                className={`py-3 text-base font-medium ${isActive("/how-it-works") ? "text-white font-semibold" : "text-muted"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                How it works
              </Link>
              <Link
                href="/use-cases"
                className={`py-3 text-base font-medium ${isActive("/use-cases") ? "text-white font-semibold" : "text-muted"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Use cases
              </Link>
              <Link
                href="/pricing"
                className={`py-3 text-base font-medium ${isActive("/pricing") ? "text-white font-semibold" : "text-muted"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/tools/product-photo-prompt-generator"
                className="py-3 text-base font-medium text-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                Free prompt tool
              </Link>
              <Link
                href="/faq"
                className={`py-3 text-base font-medium ${isActive("/faq") ? "text-white font-semibold" : "text-muted"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/blog"
                className={`py-3 text-base font-medium ${isActive("/blog") ? "text-white font-semibold" : "text-muted"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/dashboard/create"
                className={`py-3 text-base font-medium ${isActive("/dashboard/create") ? "text-white font-semibold" : "text-muted"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Create
              </Link>
              {user && (
                <span className="py-3 text-base text-muted">
                  Credits: {user.credits_balance}
                </span>
              )}
              <Link
                href="/dashboard"
                className="mt-2 block rounded bg-white px-6 py-3 text-center font-medium text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="py-3 text-left text-base font-medium text-muted"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`py-3 text-base font-medium ${isActive(href) ? "font-semibold text-white" : "text-muted"}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/login"
                className="mt-4 block rounded border border-[#27272a] px-6 py-3 text-center font-semibold text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="mt-2 block rounded bg-white px-6 py-3 text-center font-semibold text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
