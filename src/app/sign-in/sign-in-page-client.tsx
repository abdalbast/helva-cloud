"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { extractEmailAddress, getInboxLink } from "@/lib/magic-link";

type PendingProvider = "google" | "email" | null;

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  const domainNotVerified = "sender domain is not verified in Resend";
  if (error.message.includes(domainNotVerified)) {
    return "Email sign-in is not fully configured yet. Verify the sender domain in Resend, then try again.";
  }

  const uncaughtMatch = error.message.match(/Uncaught Error:\s*(.+?)(?:\n|$)/);
  if (uncaughtMatch?.[1]) {
    return uncaughtMatch[1];
  }

  return error.message;
}

export function SignInPageClient({
  magicLinkSender,
}: {
  magicLinkSender: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();

  const [step, setStep] = useState<"initial" | "sent">("initial");
  const [email, setEmail] = useState("");
  const [pendingProvider, setPendingProvider] = useState<PendingProvider>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchParams.get("error") === "access_denied") {
      setError("Google sign-in was cancelled. Please try again.");
      return;
    }
    if (searchParams.get("error")) {
      setError("Sign-in failed. Please try again.");
    }
  }, [searchParams]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-caption text-foreground/40 animate-pulse">Loading…</span>
      </div>
    );
  }

  const isLocalDev =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const senderEmail = extractEmailAddress(magicLinkSender);
  const inboxLink = getInboxLink(email, senderEmail);

  const handleGoogle = async () => {
    setPendingProvider("google");
    setError(null);
    try {
      const result = await signIn("google", { redirectTo: "/app" });
      if (!result.redirect) {
        setError("Google sign-in could not be started. Check the provider configuration and try again.");
        setPendingProvider(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setPendingProvider(null);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setPendingProvider("email");
    setError(null);
    try {
      const result = await signIn("email", { email, redirectTo: "/app" });
      if (result.signingIn) {
        router.replace("/app");
        return;
      }
      setStep("sent");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-caption text-foreground/50 hover:text-mistral-orange transition mb-6"
          >
            ← Back to home
          </Link>
          <Link
            href="/"
            className="block text-caption uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition"
          >
            HELVA CLOUD
          </Link>
          <h1 className="mt-5 text-base font-normal text-foreground">
            Sign in to your workspace
          </h1>
        </div>

        {step === "initial" ? (
          <>
            <button
              onClick={handleGoogle}
              disabled={pendingProvider !== null}
              className="w-full flex items-center justify-center gap-3 rounded-[2px] border border-foreground/10 bg-surface-pure px-4 py-2.5 text-sm text-foreground/80 hover:bg-foreground/5 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" />
              </svg>
              {pendingProvider === "google" ? "Redirecting to Google…" : "Continue with Google"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-foreground/8" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-[11px] text-foreground/35 uppercase tracking-wider">
                  or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
                className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-mistral-orange/40 placeholder:text-foreground/25 transition-colors"
              />
              <button
                type="submit"
                disabled={pendingProvider !== null || !email.trim()}
                className="w-full rounded-[2px] bg-mistral-orange px-4 py-2.5 text-sm text-white hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pendingProvider === "email" ? "Sending link…" : "Send sign-in link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="mx-auto w-10 h-10 rounded-full bg-mistral-orange/10 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-mistral-orange">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-foreground">Check your inbox</p>
              <p className="text-xs text-foreground/50 mt-1">
                We sent a sign-in link to <strong className="text-foreground/70">{email}</strong>
              </p>
            </div>
            <p className="text-xs text-foreground/40">
              Click the link in the email to sign in. It expires in 1 hour and may land in spam the first time.
            </p>
            <p className="text-xs text-foreground/45">
              Search for a message from <strong className="text-foreground/70">{senderEmail}</strong>.
            </p>
            {inboxLink && (
              <a
                href={inboxLink.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-[2px] border border-foreground/10 bg-surface-pure px-4 py-2.5 text-sm text-foreground/80 hover:bg-foreground/5 active:scale-[0.98] transition"
              >
                {inboxLink.label}
              </a>
            )}
            {inboxLink && (
              <p className="text-xs text-foreground/40">
                {inboxLink.description}
              </p>
            )}
            {isLocalDev && (
              <p className="text-xs text-foreground/45">
                Local dev uses <strong className="text-foreground/70">{senderEmail}</strong>. If the email does not arrive, check your Convex logs for a preview magic link.
              </p>
            )}
            <button
              type="button"
              onClick={() => { setStep("initial"); setError(null); }}
              className="text-xs text-foreground/45 hover:text-foreground/70 transition underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
