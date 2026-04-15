"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function UserInfo() {
  const user = useQuery(api.users.me);
  if (!user?.email) return null;
  return (
    <span className="text-caption text-foreground/50 hidden lg:inline">
      {user.email}
    </span>
  );
}
