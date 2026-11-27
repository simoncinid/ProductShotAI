"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { publicCreditPacks } from "@/lib/product-info";
import { creditsApi, userApi, recoveryApi } from "@/lib/api";
import { useAuthenticated } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  PricingShowcase,
  type PricingPlan,
} from "@/components/PricingShowcase";
import { gaEvent } from "@/lib/ga";
import { rememberPurchase, trackFunnel } from "@/lib/funnel";

const CONTAINER = "mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14";

export default function PricingCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authenticated = useAuthenticated();
  const queryClient = useQueryClient();

  const {
    data: packsData,
    isLoading: packsLoading,
    isError: packsError,
    refetch: refetchPacks,
  } = useQuery({
    queryKey: ["credit-packs"],
    queryFn: creditsApi.getPacks,
    initialData: { packs: publicCreditPacks },
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: userApi.getMe,
    enabled: authenticated === true,
    retry: false,
  });

  const { data: offer } = useQuery({
    queryKey: ["recovery-offer", user?.id],
    queryFn: recoveryApi.offer,
    enabled: !!user,
    retry: false,
  });

  const sessionId = searchParams.get("session_id");
  const confirmedSession = useRef<string | null>(null);
  const {
    data: payment,
    isError: paymentError,
    refetch: recheckPayment,
  } = useQuery({
    queryKey: ["checkout-status", sessionId],
    queryFn: () => creditsApi.checkoutStatus(sessionId!),
    enabled: !!authenticated && !!sessionId,
    refetchInterval: (query) => (query.state.data?.credited ? false : 3000),
    retry: 2,
  });

  useEffect(() => {
    if (
      payment?.credited &&
      sessionId &&
      confirmedSession.current !== sessionId
    ) {
      confirmedSession.current = sessionId;
      toast.success("Payment confirmed. Your credits are ready!");
      trackFunnel("purchase_credited");
      if (payment.amount_total != null && payment.currency)
        gaEvent("purchase", {
          transaction_id: sessionId,
          value: payment.amount_total / 100,
          currency: payment.currency.toUpperCase(),
          items: [
            {
              item_id: payment.pack_id || "credits",
              item_name: "ProductShotAI credit pack",
              quantity: 1,
            },
          ],
        });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["recovery-offer"] });
    }
  }, [payment?.credited, sessionId, queryClient]);

  const purchaseMutation = useMutation({
    mutationFn: ({
      packId,
      successUrl,
      cancelUrl,
    }: {
      packId: string;
      successUrl: string;
      cancelUrl: string;
    }) => creditsApi.purchase(packId, successUrl, cancelUrl),
    onSuccess: (data) => {
      if (data?.checkout_url) {
        trackFunnel("checkout_created");
        window.location.href = data.checkout_url;
      }
    },
    onError: (error: unknown) => {
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : null;
      trackFunnel("checkout_error");
      toast.error(msg || "Could not open checkout. Please try again.");
    },
  });

  const handlePurchase = (packId: string) => {
    trackFunnel("credit_pack_selected", { pack: packId });
    if (!authenticated) {
      rememberPurchase(packId);
      router.push("/signup");
      return;
    }
    const base = typeof window !== "undefined" ? window.location.origin : "";
    purchaseMutation.mutate({
      packId,
      successUrl: `${base}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${base}/pricing?cancelled=1&pack=${packId}`,
    });
  };

  const packs = packsData?.packs || [];
  const selectedPack = packs.find(
    (p: { id: string }) => p.id === searchParams.get("pack"),
  );
  const isPopular = (id: string) => (id || "").toLowerCase() === "standard";

  return (
    <>
      {offer?.available && (
        <div role="status" className={`${CONTAINER} pb-6`}>
          <div className="rounded-xl border border-teal-300/40 bg-teal-300/10 p-6 text-white">
            <p className="text-xl font-semibold">
              Your personal apology offer: 30% off one credit pack
            </p>
            <p className="mt-2 text-slate-300">
              Automatically applied at checkout, only for your account. Valid
              until {new Date(offer.expires_at!).toLocaleDateString()}. Full
              prices are shown below; Stripe shows your discounted total before
              payment.
            </p>
          </div>
        </div>
      )}
      {sessionId && (
        <div role="status" className={`${CONTAINER} pb-6 text-white`}>
          {payment?.credited ? (
            <p>
              Your credits are ready.{" "}
              <Link href="/dashboard/create" className="underline">
                Create your first image →
              </Link>
            </p>
          ) : paymentError ? (
            <p>
              We could not verify this checkout.{" "}
              <button onClick={() => recheckPayment()} className="underline">
                Check again
              </button>{" "}
              or contact support if you were charged.
            </p>
          ) : (
            <p>
              {authenticated
                ? "Checking your payment and credit balance… This can take a moment."
                : "Sign in to check your payment and credit balance."}
            </p>
          )}
        </div>
      )}
      {searchParams.get("cancelled") === "1" && (
        <p role="status" className={`${CONTAINER} pb-6 text-[#c9ccd1]`}>
          Checkout was cancelled. You can choose a pack and try again.
        </p>
      )}
      {selectedPack && (
        <div className={`${CONTAINER} pb-6`}>
          <button
            onClick={() => handlePurchase(searchParams.get("pack")!)}
            disabled={purchaseMutation.isPending}
            className="min-h-12 rounded bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            {purchaseMutation.isPending
              ? "Opening checkout…"
              : `Continue with ${selectedPack.name} — $${selectedPack.total_price.toFixed(2)} USD →`}
          </button>
        </div>
      )}
      {packsLoading && (
        <p role="status" className={`${CONTAINER} py-8 text-white`}>
          Loading credit packs…
        </p>
      )}
      {packsError && (
        <div role="alert" className={`${CONTAINER} py-8 text-white`}>
          Credit packs could not load.{" "}
          <button className="underline" onClick={() => refetchPacks()}>
            Try again
          </button>
        </div>
      )}

      <PricingShowcase
        plans={packs.map(
          (pack: {
            id: string;
            name: string;
            total_price: number;
            credits: number;
            price_per_credit: number;
          }): PricingPlan => ({
            id: pack.id,
            name: pack.name,
            price: `$${pack.total_price.toFixed(2)}`,
            credits: pack.credits,
            each: `$${pack.price_per_credit.toFixed(2)}`,
            popular: isPopular(pack.id),
          }),
        )}
        eyebrow="Choose a credit pack"
        title="Choose your first photo pack."
        description="Try Starter for $4.95, or choose Standard for more variations. Secure payment through Stripe."
        balance={authenticated && user ? user.credits_balance : null}
        ctaMode="purchase"
        pending={purchaseMutation.isPending}
        onPurchase={handlePurchase}
      />
    </>
  );
}
