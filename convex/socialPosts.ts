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
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("socialPosts")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const socialPosts = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("socialPosts")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(socialPosts);
  },
});

export const create = mutation({
  args: {
    platform: v.string(),
    content: v.string(),
    scheduledAt: v.optional(v.string()),
    status: v.optional(statusType),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const { platform, content, scheduledAt, status } = args;
    return await ctx.db.insert("socialPosts", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      platform,
      content,
      scheduledAt: scheduledAt ?? null,
      status: status ?? "draft",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("socialPosts"),
    platform: v.optional(v.string()),
    content: v.optional(v.string()),
    scheduledAt: v.optional(v.string()),
    status: v.optional(statusType),
  },
  handler: async (ctx, { id, platform, content, scheduledAt, status }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (platform !== undefined) updates.platform = platform;
    if (content !== undefined) updates.content = content;
    if (scheduledAt !== undefined) updates.scheduledAt = scheduledAt;
    if (status !== undefined) updates.status = status;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("socialPosts") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
