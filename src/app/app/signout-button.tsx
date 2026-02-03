"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border px-3 py-2 text-sm hover:bg-foreground/5"
    >
      Sign out
    </button>
  );
}
