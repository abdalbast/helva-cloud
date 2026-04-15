import type { QueryCtx, MutationCtx } from "../_generated/server";

export async function getUserEmail(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  if (!identity.email) return null;
  return identity.email;
}

export async function requireUserEmail(ctx: QueryCtx | MutationCtx): Promise<string> {
  const email = await getUserEmail(ctx);
  if (!email) throw new Error("Unauthenticated");
  return email;
}
