"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push("/sign-in");
      }}
      className="rounded-none border-none bg-surface-cream p-2 text-foreground transition hover:bg-surface-warm hover:text-mistral-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/30"
      title="Sign out"
    >
      <LogOut size={16} />
    </button>
  );
}
