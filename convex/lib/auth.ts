import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

export type ViewerIdentity = {
  authSubject: string;
  email: string | null;
};

type TenantDoc = {
  _id: unknown;
  authSubject?: string | null;
  userEmail: string;
};

export async function getViewerIdentity(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<ViewerIdentity | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return {
    authSubject: identity.tokenIdentifier,
    email: identity.email ?? null,
  };
}

export async function requireViewerIdentity(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<{ authSubject: string; email: string }> {
  const viewer = await getViewerIdentity(ctx);
  if (!viewer) throw new Error("Unauthenticated");
  if (!viewer.email) {
    throw new Error("Authenticated identity is missing an email during migration");
  }
  return {
    authSubject: viewer.authSubject,
    email: viewer.email,
  };
}

export async function getUserEmail(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<string | null> {
  return (await getViewerIdentity(ctx))?.email ?? null;
}

export async function requireUserEmail(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<string> {
  return (await requireViewerIdentity(ctx)).email;
}

export function isOwnedByViewer(
  doc: TenantDoc | null,
  viewer: ViewerIdentity | null,
): doc is TenantDoc {
  if (!doc || !viewer) return false;
  if (doc.authSubject) {
    return doc.authSubject === viewer.authSubject;
  }
  return viewer.email !== null && doc.userEmail === viewer.email;
}

export function mergeTenantResults<T extends { _id: string }>(
  ...groups: T[][]
): T[] {
  const merged = new Map<string, T>();
  for (const group of groups) {
    for (const doc of group) {
      merged.set(doc._id, doc);
    }
  }
  return [...merged.values()];
}

export function sortByCreationTime<T extends { _creationTime: number }>(
  docs: T[],
  order: "asc" | "desc" = "asc",
): T[] {
  return [...docs].sort((left, right) =>
    order === "asc"
      ? left._creationTime - right._creationTime
      : right._creationTime - left._creationTime,
  );
}

export async function backfillAuthSubjectIfNeeded<
  T extends TenantDoc & { _id: unknown },
>(
  ctx: MutationCtx,
  doc: T,
  viewer: ViewerIdentity,
): Promise<void> {
  if (doc.authSubject || viewer.email === null) return;
  if (doc.userEmail !== viewer.email) return;
  await ctx.db.patch(doc._id as never, { authSubject: viewer.authSubject });
}
