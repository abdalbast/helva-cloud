"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            await signOut();
            router.push("/sign-in");
          } catch {
            setError("Sign out failed. Please try again.");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className="rounded-none border-none bg-surface-cream p-2 text-foreground transition hover:bg-surface-warm hover:text-mistral-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/30 disabled:cursor-not-allowed disabled:opacity-60"
        title="Sign out"
        aria-label="Sign out"
        aria-busy={loading}
      >
        <LogOut size={16} />
      </button>
      {error ? (
        <p className="max-w-48 text-right text-caption text-mistral-orange">{error}</p>
      ) : null}
    </div>
  );
}
