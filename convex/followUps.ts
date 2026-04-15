import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  backfillAuthSubjectIfNeeded,
  getViewerIdentity,
  isOwnedByViewer,
  mergeTenantResults,
  requireViewerIdentity,
  sortByCreationTime,
} from "./lib/auth";

const statusType = v.union(
  v.literal("pending"),
  v.literal("done"),
  v.literal("snoozed"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("followUps")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const followUps = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("followUps")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(followUps);
  },
});

export const overdueCount = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return 0;

    const byAuthSubject = await ctx.db
      .query("followUps")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .collect();

    const followUps = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("followUps")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .collect(),
        )
      : byAuthSubject;

    const now = new Date().toISOString();
    return followUps.filter(
      (followUp) => followUp.status === "pending" && followUp.dueAt <= now,
    ).length;
  },
});

export const create = mutation({
  args: {
    description: v.string(),
    dueAt: v.string(),
    contactId: v.optional(v.id("contacts")),
    dealId: v.optional(v.id("deals")),
    status: v.optional(statusType),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const { description, dueAt, contactId, dealId, status } = args;
    return await ctx.db.insert("followUps", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      description,
      dueAt,
      contactId: contactId ?? null,
      dealId: dealId ?? null,
      status: status ?? "pending",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("followUps"),
    status: v.optional(statusType),
    description: v.optional(v.string()),
    dueAt: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, description, dueAt }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (description !== undefined) updates.description = description;
    if (dueAt !== undefined) updates.dueAt = dueAt;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});
